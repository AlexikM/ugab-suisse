#!/usr/bin/env bash
#
# The deploy key and the repository configuration for one environment, in one
# command. Everything a human has to do by hand afterwards is printed at the
# end; there are two things and neither can be automated.
#
#   ./scripts/setup-infomaniak.sh staging
#
# Nothing here touches the site or the server. It generates a keypair, asks the
# server which host keys it presents, and writes both into GitHub's secret
# store through `gh`. The private key is written to a temporary file with no
# group or world permissions, passed to `gh` by path, and deleted — it is never
# echoed, never committed, and never left in shell history.
#
# See docs/infomaniak-in-fifteen-minutes.md for what this is a part of.

set -euo pipefail

environment="${1:-}"
case "$environment" in
  staging | production) ;;
  *)
    echo "usage: $0 <staging|production>" >&2
    exit 64
    ;;
esac
prefix=$(printf '%s' "$environment" | tr '[:lower:]' '[:upper:]')
[ "$prefix" = 'PRODUCTION' ] && prefix='PROD'

command -v gh >/dev/null || { echo 'gh is not installed.' >&2; exit 69; }
gh auth status >/dev/null 2>&1 || { echo 'gh is not signed in — run `gh auth login`.' >&2; exit 69; }
command -v ssh-keygen >/dev/null || { echo 'ssh-keygen is not installed.' >&2; exit 69; }

# Reads one required answer. A closed input is an answer too — it means nobody
# is there to type, and asking again forever is how a script hangs a CI job.
ask() {
  local prompt="$1" answer=''
  while [ -z "$answer" ]; do
    printf '%s' "$prompt" >&2
    if ! read -r answer; then
      echo >&2
      echo 'No input — this script is interactive, run it from a terminal.' >&2
      exit 66
    fi
  done
  printf '%s' "$answer"
}

echo "Configuring $environment. Four answers, from the Infomaniak manager." >&2
echo >&2
ssh_host=$(ask '  SSH hostname (FTP/SSH section)      : ')
ssh_user=$(ask '  SSH username                        : ')
deploy_path=$(ask '  Absolute document root of the site  : ')
site_url=$(ask '  Public URL, bare origin, no path    : ')

# A path is what publish.yml refuses to build for: astro.config.mjs takes the
# base prefix from this value, and a site served from a subdirectory is not
# what any of this is set up for. Catch it here rather than in a failed run.
case "$site_url" in
  https://*) ;;
  *) echo 'The site URL must start with https:// — the deploy publishes over TLS only.' >&2; exit 64 ;;
esac
case "${site_url#https://}" in
  */*[!/]*)
    echo "The site URL carries a path: $site_url" >&2
    echo 'Give the bare origin — astro.config.mjs takes the base prefix from this' >&2
    echo 'value, and publish.yml refuses a site built for a subdirectory.' >&2
    exit 64
    ;;
esac
site_url="${site_url%/}"

workdir=$(mktemp -d)
trap 'rm -rf "$workdir"' EXIT
key="$workdir/deploy_key"

echo >&2
echo 'Generating an Ed25519 deploy key, no passphrase — a passphrase nothing can' >&2
echo 'type is a passphrase that stops the deploy rather than protecting it.' >&2
ssh-keygen -t ed25519 -N '' -C "ugab-suisse deploy ($environment)" -f "$key" >/dev/null

echo 'Asking the server which host keys it presents…' >&2
# -T bounds the wait. Without it an unreachable host leaves this sitting for
# minutes with nothing on screen, which reads as a hang rather than a mistyped
# hostname — and a mistyped hostname is the likeliest thing to go wrong here.
ssh-keyscan -T 10 -H "$ssh_host" > "$workdir/known_hosts" 2>/dev/null || true
if [ ! -s "$workdir/known_hosts" ]; then
  echo "No host key came back from $ssh_host within ten seconds." >&2
  echo 'Check the hostname, and that SSH is enabled on the hosting account.' >&2
  exit 69
fi

set_secret() { gh secret set "$1" --body "$2" >/dev/null && echo "  secret   $1" >&2; }

set_secret "${prefix}_SSH_HOST" "$ssh_host"
set_secret "${prefix}_SSH_USER" "$ssh_user"
set_secret "${prefix}_DEPLOY_PATH" "$deploy_path"
gh secret set "${prefix}_SSH_KEY" < "$key" >/dev/null && echo "  secret   ${prefix}_SSH_KEY" >&2
gh secret set "${prefix}_SSH_KNOWN_HOSTS" < "$workdir/known_hosts" >/dev/null \
  && echo "  secret   ${prefix}_SSH_KNOWN_HOSTS" >&2

# A variable and not a secret: deploy.yml gates on it in a job-level `if`, and
# the secrets context is not available there. It is also not a secret — it is
# the address the site answers on.
gh variable set "${prefix}_SITE_URL" --body "$site_url" >/dev/null \
  && echo "  variable ${prefix}_SITE_URL" >&2

cat >&2 <<EOF

Done here. Two things remain, and neither can be done from a terminal.

1. Authorise the key. Paste this single line into the Infomaniak manager, under
   the hosting account's SSH keys:

$(cat "$key.pub")

2. $(if [ "$environment" = 'staging' ]; then
     printf '%s' 'Turn on directory protection (HTTP basic authentication) for the site,
   and give the committee the password. The publish refuses to finish unless an
   unauthenticated request is refused with a 401, so this is not optional —
   staging carries drafts and real names.'
   else
     printf '%s' 'Nothing — production is public by design. Check the site answers on
   https:// before publishing.'
   fi)

Then: Actions -> Deploy -> Run workflow -> $environment.
EOF
