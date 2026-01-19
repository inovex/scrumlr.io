---
title: Scrumlr releases
description: Guide for scrumlr releases
---

Scrumlr gets new releases about every 4 weeks on [github](https://github.com/inovex/scrumlr.io/releases).
The releases are get a version that follows the [semver versioning](https://semver.org/).
A scrumlr version looks like the following: `v4.3.1`.

## Create a new release

The following steps should be followed when creating a new release

1. Make sure all PRs that the release should include are merged
2. Create a new PR to update the version number for scrumlr and merge it. This PR should include the folowing files
    - `src/package.json`
    - `deployment/docker/.env.example`
    - `deployment/docker/docker-compose.yaml`
    - `deployment/helm/scrumlr/Chart.yaml`
    - `deployment/helm/scrumlr/tests/backend/deployment_test.yaml`
    - `deployment/helm/scrumlr/tests/frontend/deployment_test.yaml`
    - `server/src/initialize/otel.go`
3. Go to the [release page](https://github.com/inovex/scrumlr.io/releases) a draft a new release
4. Create a new tag by entering the tag. Make sure the tag has the form `v1.2.3` to follow the smver versioning
5. Add the release name. The name is the same like the tag from step 4
6. Generate the release note
7. Read through the release notes. Make sure all PRs are listed in one of the following categories
    - ✨ Features
    - 🐛 Fixes
    - 🔄 Refactoring
    - 🎨 Style
    - 🌐 Localization
    - ⚙️ Chores
    - 📚 Docs
    - 🤖 CI
8. If necessary add a deprecation warning on top of the release notes
9. Publish the release
