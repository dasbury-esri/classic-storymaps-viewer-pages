# Runtime Font Provenance

Reviewed on 2026-10-14. This resolves the outstanding Shortlist font decisions
below, not the rights to every copied website, catalog image or story asset.

## Ionicons

All four retained Shortlist source fonts match the public Ionicons **v2.0.1**
release byte-for-byte at commit
[`ecb4b806831005c25b97ed9089fbb1d7dcc0879c`](https://github.com/ionic-team/ionicons/tree/ecb4b806831005c25b97ed9089fbb1d7dcc0879c).
The bundled CSS says v2.0.0, but that release has twelve different SVG glyphs;
all 733 match v2.0.1. The upstream README independently identifies the MIT terms.

| Source font | SHA-256 |
| --- | --- |
| ionicons.eot | a4803d7bdeb478a5b9238fe74d8aaa98dafe2e8e68fccbd0e3f4dced823f27f0 |
| ionicons.svg | a627d9068c1235d9b3c95c405eb6ecb64a290b159cf5e926c0d96d89b24cd5fc |
| ionicons.ttf | 2ba7f20b1d8990e17a47fe3d88e4c766628aaa2baf1dd30fca0a0db59836f5f9 |
| ionicons.woff | 709f2789daaff440820ebb975d3ae409af45121bdec47e39e83523490b1bc0fc |

The [unchanged upstream MIT license](ionicons-2.0.1-LICENSE.txt) credits
Copyright (c) 2014 Drifty. Its SHA-256 is
`5407c91b6c8b7305f72aec4ee5ffb99b32ed9a5413c19cf3cd1b94354d2645e8`.
The staging helper verifies these source hashes and ships the full license.
It also preserves the bundled CSS's Google Material Design Icons attribution,
CC BY 4.0 link and statement that upstream modified those icons to fit the
Ionicons grid. Generic MIT text alone would omit that attribution.

An earlier isolated publish from existing build trees verified three binary formats
exactly and the SVG after CR/LF normalization. The older build's SVG differs
only in line endings. This check did not freshly rebuild all eight runtimes.

## Retired Unidentified Fonts

The owner approved removal of the unused `icomoon` and `fontelloIcons` bundles
under `runtimes/shortlist/upstream/src/resources/tpl/viewer/font/font/`.
Tracked-source inspection and independent Git searches found no Shortlist
CSS, JavaScript, HTML or JSON consumer. Each file matched HEAD before removal.
The following eight files were removed; publication also strips stale copies
from older build output. No license was inferred from a font generator's name.

| Removed file | SHA-256 before removal |
| --- | --- |
| icomoon.eot | 68772b883949399c4c2acec9ae4ecb0d2657ff352e417dc47afbe893135834ac |
| icomoon.svg | 750c2406bec5e17ab4cdf480a7bfb1a0c68806016b690e00dfdb5c3b18b19d64 |
| icomoon.ttf | cf37b0d09ed09f1050129ceb1ab35e565305a5be767e241bbf63b6e55461388a |
| icomoon.woff | 3a9848af462f3c32927a9840911d4ffb9424e6d638bd1be248561619514ccded |
| fontelloIcons.eot | d908241ef1ddee6fb7159629bff23ab29bc2b916d9d04f72187c1502a2dac5e7 |
| fontelloIcons.svg | c9454c93bf88fbcf001403966933c123258ab931903c5fc3cfcff03588b688a8 |
| fontelloIcons.ttf | 9ebf2fe077426dfb9bdaa4f7b237b575d44c5be28bc8e495a25ef18d477d8abf |
| fontelloIcons.woff | d8aff80833633bc756b7d829fc43db840734767e70f752051ea722ef6502d774 |

The site's Tailcoat font was generated with IcoMoon. Basic's retained social
font identifies itself as Fontello, not IcoMoon; the older combined description
was incorrect. These are separate files and were not removed or cleared by the
Shortlist review. Their exact inventory follows below.
The retained four-glyph Shortlist Fontello set has its own config selecting
Fontelico and Entypo glyphs and its own upstream copyright/license notice;
those records and the full OFL terms remain included in runtime notices.

Initial revalidation on 2026-10-17 passed 138 viewer tests and checked existing
build trees. Fresh downloads from the pinned public Ionicons commit independently
matched all four retained source fonts and the complete MIT license.

The subsequent [fresh release check](../../session-logs/2026-10-17-0003-session-log.md)
started with empty runtime output directories and passed 139 viewer tests under
Node 24 plus 68 published-link checks. All 297 referenced notice documents
existed and all eight retired fonts were absent. External `cmp` checks verified
the 43 copied upstream documents, root licenses and 210 editor-source copies.
Published Ionicons binaries matched exactly; SVG matched after line-ending
normalization. The check also fixed a CLI path comparison that previously skipped
notice staging when invoked through a symlinked directory. No runtime source font
was rewritten, and no Pages deployment occurred. Build-source selections and
legacy warnings are recorded in the linked log; hosted acceptance and other
content-rights questions remain separate.

## Tailcoat and Basic Social Font Inventory

The [exact path inventory](../testing/remaining-content-inventory.json) records
all eight files, their byte sizes, Git identities and SHA-256 values. External
`shasum` verified all eight. The following directory prefixes are repository-relative:

- Tailcoat: `apps/classic-storymaps-site/assets/fonts/tailcoat/`
- Basic social: `runtimes/basic/upstream/font/`

| File | SHA-256 |
| --- | --- |
| tailcoat.eot | 3ce19b159c5609c3667ee864e54aa6a2b366d6bfc6dfd30a4d59afc5915123fb |
| tailcoat.svg | ef161435e05933a75f8da062d9537dc91836075d4b5ab30925b50b31408c8789 |
| tailcoat.ttf | 620b005ffb2388e5a4aea73258c204575d03bb3fa29a45fc243e1c123ba35023 |
| tailcoat.woff | fffe88671a4956518063cc654cfc525ab2e2b45b28608552a3ce06025abb18b5 |
| social.eot | 46a961aded26d2cfec9d2571bcfe3b40474dfc9789a3d6262cae1daad42bce74 |
| social.svg | 583fae4a7409a374d7cbdf5fdee1baa2427adc428afc47d65899542e7b85f2fd |
| social.ttf | 59f5f17d1a5b8ce9bfa82c869903f7e0b423700895722c81514a59ec7b56aaae |
| social.woff | 4d644df2b72987f5ac5e1c7efd88b20dad5c2e7790355db711220574896a8d8b |

### Consumers and Metadata

Tailcoat is referenced by
[screen.css](../../apps/classic-storymaps-site/assets/css/archive/screen.css#L2310)
in two font-face blocks, beginning at lines 2310 and 5013. Each block refers
to the EOT, WOFF, TTF and SVG formats. Local import history identifies asset
localization commit `6017b6c`; that is not a grant from each glyph's author.

Basic social is referenced by
[main.css](../../runtimes/basic/upstream/css/main.css#L40), using all four
formats. Local import history identifies `d7edbc2`. The runtime has no
`runtime-manifest.json`; no exact public upstream revision was inferred.

FontTools independently read both TTF/WOFF pairs. Tailcoat identifies family
`tailcoat`, Regular, Version 1.2, with 145 glyph entries. No copyright or
license-text/license-URL name record was present among the inspected fields.
Its SVG contains 142 glyph elements and metadata `Generated by IcoMoon`.

Basic's TTF/WOFF pair identifies `fontello`, Regular, Version 1.0, with six
glyph entries and `Copyright (C) 2015 by original authors @ fontello.com`.
Its SVG identifies the same family/copyright and contains five glyph elements.
No license-text/license-URL name record was present. SVG element counts and
binary glyph counts are different measures, not a cross-format equality test.

Basic has a root Apache-2.0 license and a README crediting Esri and the public
Viewer template. Those are recorded source context, not proof of the origin or
license of each custom glyph. Neither a generator label nor generic copyright
metadata supplies the missing font-specific permission evidence.

### Current Disposition

Keep both families in place pending a scoped decision on original glyph sources,
applicable terms and required attribution, or an owner-approved replacement.
Unlike the retired unused Shortlist fonts, these have direct CSS references;
no removal is proposed or authorized by this inventory. EOT files were hashed
but their metadata was not independently decoded. No font bytes were changed.
