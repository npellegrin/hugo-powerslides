#!/usr/bin/env bash
# Installs an official Hugo release (standard edition, Linux x64) after checking its SHA-256 checksum.
# Usage: install-hugo.sh <version|latest>
set -euo pipefail

version="${1:?Usage: install-hugo.sh <version|latest>}"

if [ "$version" = "latest" ]; then
  version="$(curl -fsSL https://api.github.com/repos/gohugoio/hugo/releases/latest | jq -r '.tag_name')"
  version="${version#v}"
fi

base_url="https://github.com/gohugoio/hugo/releases/download/v${version}"
archive="hugo_${version}_linux-amd64.tar.gz"
checksums="hugo_${version}_checksums.txt"
workdir="$(mktemp -d)"
trap 'rm -rf "$workdir"' EXIT

cd "$workdir"
curl -fsSLO "${base_url}/${archive}"
curl -fsSLO "${base_url}/${checksums}"
grep " ${archive}\$" "$checksums" | sha256sum --check --strict

tar -xzf "$archive" hugo
sudo install -m 0755 hugo /usr/local/bin/hugo
hugo version
