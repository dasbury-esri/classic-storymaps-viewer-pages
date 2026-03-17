# Phase 5 S10e - StoryMaps Org Viewer Probe

Date: 2026-03-17
Domain: story.maps.arcgis.com
Org ID: nzS0F0zdNLvs7nc8
Org Name: ArcGIS StoryMaps
Viewer Base: https://storymaps.esri.com/templates/classic-storymaps
Source Query: orgid:nzS0F0zdNLvs7nc8 AND access:public AND type:"Web Mapping Application"

## Scope
- Pulled classic Web Mapping Application items using the same REST search pattern used by classic-story-search.
- Mapped source item URL types to this repo's supported runtimes.
- Probed each mapped viewer URL and ArcGIS item endpoint.
- Classified failures into actionable diagnosis buckets.

## Summary
- Total records evaluated: 250
- readyForManualRuntimeLoadTest: 243
- appItemNotAuthorized: 5
- missingAppIdInSourceUrl: 2

### Runtime Distribution
- cascade: 56
- mapjournal: 52
- mapseries: 39
- maptour: 34
- swipe: 27
- basic: 27
- crowdsource: 8
- shortlist: 7

## Highest-Priority Failures
| Runtime | App ID | Diagnosis | Item Status | Viewer HTTP | Source URL |
|---|---|---|---|---:|---|
| shortlist | (none) | missingAppIdInSourceUrl | missingAppId | - | https://storymaps.esri.com/stories/shortlist-palmsprings/ |
| mapjournal | 6d920df507b5430fbd2c69c74ed21c6f | appItemNotAuthorized | notAuthorized | 200 | https://wcs-global.maps.arcgis.com/apps/MapJournal/?appid=6d920df507b5430fbd2c69c74ed21c6f |
| mapseries | 58f90c5a5b5f4f94aaff93211c45e4ec | appItemNotAuthorized | notAuthorized | 200 | https://icfgeospatial.maps.arcgis.com/apps/MapSeries/index.html?appid=58f90c5a5b5f4f94aaff93211c45e4ec |
| mapseries | 53cf1b54abf34c4bacdec863e5c56391 | appItemNotAuthorized | notAuthorized | 200 | https://walgreens.maps.arcgis.com/apps/MapSeries/index.html?appid=53cf1b54abf34c4bacdec863e5c56391 |
| cascade | 6a9c3a5af20b43dea05fbd1e121ef6da | appItemNotAuthorized | notAuthorized | 200 | https://blm-egis.maps.arcgis.com/apps/Cascade/index.html?appid=6a9c3a5af20b43dea05fbd1e121ef6da |
| cascade | 15a744844c714434a158c9191fd74a48 | appItemNotAuthorized | notAuthorized | 200 | https://nrcs.maps.arcgis.com/apps/Cascade/index.html?appid=15a744844c714434a158c9191fd74a48 |
| shortlist | (none) | missingAppIdInSourceUrl | missingAppId | - | https://storymaps.esri.com/stories/shortlist-sandiego/ |

## Ready For Manual Runtime Load Verification
| Runtime | App ID | Views | Viewer URL |
|---|---|---:|---|
| maptour | d79e17055aa14e119c9c6e8621b23a6a | 1370010 | https://storymaps.esri.com/templates/classic-storymaps/maptour/index.html?appid=d79e17055aa14e119c9c6e8621b23a6a |
| swipe | 97ae55e015774b7ea89fd0a52ca551c2 | 407130 | https://storymaps.esri.com/templates/classic-storymaps/swipe/index.html?appid=97ae55e015774b7ea89fd0a52ca551c2 |
| mapseries | 50aea84a9853491f994f775cb989ea92 | 366945 | https://storymaps.esri.com/templates/classic-storymaps/mapseries/index.html?appid=50aea84a9853491f994f775cb989ea92 |
| mapseries | e93cf59405144cb9904327ebe3a305dd | 361395 | https://storymaps.esri.com/templates/classic-storymaps/mapseries/index.html?appid=e93cf59405144cb9904327ebe3a305dd |
| mapjournal | 4c77a56bbcd743b69232cf3fd9c7a61c | 350727 | https://storymaps.esri.com/templates/classic-storymaps/mapjournal/index.html?appid=4c77a56bbcd743b69232cf3fd9c7a61c |
| cascade | 8811af6a8038442da5e2242eebe29fdd | 310531 | https://storymaps.esri.com/templates/classic-storymaps/cascade/index.html?appid=8811af6a8038442da5e2242eebe29fdd |
| mapjournal | 8cb27cf4d3b64f1e8cd9791211620a4d | 291835 | https://storymaps.esri.com/templates/classic-storymaps/mapjournal/index.html?appid=8cb27cf4d3b64f1e8cd9791211620a4d |
| mapjournal | 8ff1d1534e8c41adb5c04ab435b7974b | 277032 | https://storymaps.esri.com/templates/classic-storymaps/mapjournal/index.html?appid=8ff1d1534e8c41adb5c04ab435b7974b |
| cascade | 5605867ba55e4b929689a20892c26b36 | 255460 | https://storymaps.esri.com/templates/classic-storymaps/cascade/index.html?appid=5605867ba55e4b929689a20892c26b36 |
| mapseries | 014044fd65484a1ab965318f8b04d686 | 209949 | https://storymaps.esri.com/templates/classic-storymaps/mapseries/index.html?appid=014044fd65484a1ab965318f8b04d686 |
| mapseries | 79798a56715c4df183448cc5b7e1b999 | 205136 | https://storymaps.esri.com/templates/classic-storymaps/mapseries/index.html?appid=79798a56715c4df183448cc5b7e1b999 |
| mapseries | 597d573e58514bdbbeb53ba2179d2359 | 204375 | https://storymaps.esri.com/templates/classic-storymaps/mapseries/index.html?appid=597d573e58514bdbbeb53ba2179d2359 |
| cascade | cbd975db645549ebbc1cc6a060de5787 | 202260 | https://storymaps.esri.com/templates/classic-storymaps/cascade/index.html?appid=cbd975db645549ebbc1cc6a060de5787 |
| swipe | fc64e3596bbd4d3caf865da6d77c386e | 137636 | https://storymaps.esri.com/templates/classic-storymaps/swipe/index.html?appid=fc64e3596bbd4d3caf865da6d77c386e |
| cascade | 7d368289bba9419f93934cb530c74822 | 118015 | https://storymaps.esri.com/templates/classic-storymaps/cascade/index.html?appid=7d368289bba9419f93934cb530c74822 |
| cascade | b361b92a97c04dc783a7cb566b0bb069 | 107445 | https://storymaps.esri.com/templates/classic-storymaps/cascade/index.html?appid=b361b92a97c04dc783a7cb566b0bb069 |
| mapseries | 34934c03445649cd9fcb422a2a7279c7 | 106590 | https://storymaps.esri.com/templates/classic-storymaps/mapseries/index.html?appid=34934c03445649cd9fcb422a2a7279c7 |
| mapseries | 6aab740eb5f146d0bbc073185aa726cb | 99470 | https://storymaps.esri.com/templates/classic-storymaps/mapseries/index.html?appid=6aab740eb5f146d0bbc073185aa726cb |
| mapseries | 785dfd631af845d9b3d798b0e87914f5 | 93141 | https://storymaps.esri.com/templates/classic-storymaps/mapseries/index.html?appid=785dfd631af845d9b3d798b0e87914f5 |
| cascade | 6bcda5e199034d51b1287ed6a0db2061 | 86052 | https://storymaps.esri.com/templates/classic-storymaps/cascade/index.html?appid=6bcda5e199034d51b1287ed6a0db2061 |
| mapjournal | 34aa3fab4180400eb4cd803579bdeb61 | 85862 | https://storymaps.esri.com/templates/classic-storymaps/mapjournal/index.html?appid=34aa3fab4180400eb4cd803579bdeb61 |
| mapseries | d1799fc84e244c2f9af0e24ced4c95e1 | 81873 | https://storymaps.esri.com/templates/classic-storymaps/mapseries/index.html?appid=d1799fc84e244c2f9af0e24ced4c95e1 |
| shortlist | d9af234f65ec47d99586b54ee16e1f62 | 80401 | https://storymaps.esri.com/templates/classic-storymaps/shortlist/index.html?appid=d9af234f65ec47d99586b54ee16e1f62 |
| swipe | 58c17764db444b18aeae07ecb4fa7e41 | 79446 | https://storymaps.esri.com/templates/classic-storymaps/swipe/index.html?appid=58c17764db444b18aeae07ecb4fa7e41 |
| swipe | fba4350b6d4f4140966251b9c4d2f3a7 | 78156 | https://storymaps.esri.com/templates/classic-storymaps/swipe/index.html?appid=fba4350b6d4f4140966251b9c4d2f3a7 |

## Notes
- This probe validates route reachability and item accessibility, not full browser render behavior.
- Full load validation still requires browser execution against viewer URLs (console/network checks).
- Machine-readable artifact: docs\testing\artifacts\storymaps-org-viewer-probe-2026-03-17.json

