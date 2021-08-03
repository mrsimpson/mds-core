/* eslint-disable */
const policies = [
      {
        "name": "Prohibited Dockless Zones",
        "rules": [
          {
            "name": "Prohibited Dockless Zones",
            "maximum": 0,
            "rule_id": "3d464d96-944d-495d-be0f-73d81db194e5",
            "statuses": {
              "trip": [],
              "reserved": [],
              "available": []
            },
            "rule_type": "count",
            "geographies": [
              "c0591267-bb6a-4f28-a612-ff7f4a8f8b2a"
            ],
            "vehicle_types": [
              "bicycle",
              "scooter"
            ]
          }
        ],
        "end_date": null,
        "policy_id": "92081b54-d23b-4084-9ce2-0212b2806135",
        "start_date": 1585591200000,
        "description": "Prohibited areas for dockless vehicles within the City of Los Angeles for the LADOT Dockless On-Demand Personal Mobility Program",
        "publish_date": 1585589529326,
        "prev_policies": [
          "39a653be-7180-4188-b1a6-cae33c280341"
        ]
      },
      {
        "name": "LADOT Mobility Caps: Lime",
        "rules": [
          {
            "name": "SFV DACs",
            "maximum": 0,
            "rule_id": "d7dc6e5b-cefb-4392-a87d-f990c7b1a21b",
            "statuses": {
              "trip": [],
              "reserved": [],
              "available": [],
              "unavailable": []
            },
            "rule_type": "count",
            "geographies": [
              "e3ed0a0e-61d3-4887-8b6a-4af4f3769c14"
            ],
            "vehicle_types": [
              "bicycle",
              "scooter"
            ]
          },
          {
            "name": "All other DACs (scooters)",
            "maximum": 2500,
            "rule_id": "dc926dc9-62fb-45bf-8655-0651b59655ac",
            "statuses": {
              "trip": [],
              "reserved": [],
              "available": [],
              "unavailable": []
            },
            "rule_type": "count",
            "geographies": [
              "0c444869-1674-4234-b4f3-ab5685bcf0d9"
            ],
            "vehicle_types": [
              "bicycle",
              "scooter"
            ]
          },
          {
            "name": "Non-DAC",
            "maximum": 3000,
            "rule_id": "e659737d-e62d-45d6-8c71-ef302c355065",
            "statuses": {
              "trip": [],
              "reserved": [],
              "available": [],
              "unavailable": []
            },
            "rule_type": "count",
            "geographies": [
              "1f943d59-ccc9-4d91-b6e2-0c5e771cbc49"
            ],
            "vehicle_types": [
              "bicycle",
              "scooter"
            ]
          }
        ],
        "end_date": null,
        "policy_id": "f09ad24a-ad0e-4fb0-8770-4fd24e06eb2c",
        "start_date": 1558389669540,
        "description": "Mobility caps as described in the One-Year Permit",
        "provider_ids": [
          "63f13c48-34ff-49d2-aca7-cf6a5b6171c3"
        ],
        "publish_date": 1566936824458,
        "prev_policies": null
      },
      {
        "name": "Deactivate: VSOZ: Provider Caps",
        "rules": [
          {
            "name": "Deactivate",
            "minimum": 0,
            "rule_id": "d7286ab2-cdc2-4550-af6c-359b62778d30",
            "statuses": {},
            "rule_type": "count",
            "geographies": [
              "e0e4a085-7a50-43e0-afa4-6792ca897c5a"
            ]
          }
        ],
        "end_date": null,
        "policy_id": "29abff63-4d87-43d3-b702-1d9eb316336e",
        "start_date": 1602776888654,
        "description": "Deactivates policy da1bc3ef-8358-408a-a255-34a5d46ae991",
        "provider_ids": null,
        "publish_date": 1602776789040,
        "prev_policies": [
          "da1bc3ef-8358-408a-a255-34a5d46ae991"
        ]
      },
      {
        "name": "LADOT Mobility Caps: Sherpa",
        "rules": [
          {
            "name": "SFV DACs",
            "maximum": 410,
            "rule_id": "56f7e527-8b91-42e9-bba3-7bc86d88f720",
            "statuses": {
              "trip": [],
              "reserved": [],
              "available": [],
              "unavailable": []
            },
            "rule_type": "count",
            "geographies": [
              "e3ed0a0e-61d3-4887-8b6a-4af4f3769c14"
            ],
            "vehicle_types": [
              "bicycle",
              "scooter"
            ]
          },
          {
            "name": "All other DACs (scooters)",
            "maximum": 0,
            "rule_id": "e1aae22e-8a2a-4f63-8133-f03cc3e770fe",
            "statuses": {
              "trip": [],
              "reserved": [],
              "available": [],
              "unavailable": []
            },
            "rule_type": "count",
            "geographies": [
              "0c444869-1674-4234-b4f3-ab5685bcf0d9"
            ],
            "vehicle_types": [
              "bicycle",
              "scooter"
            ]
          },
          {
            "name": "Non-DAC",
            "maximum": 260,
            "rule_id": "2fb022bc-8f6a-4ee3-9d67-50f57866119a",
            "statuses": {
              "trip": [],
              "reserved": [],
              "available": [],
              "unavailable": []
            },
            "rule_type": "count",
            "geographies": [
              "1f943d59-ccc9-4d91-b6e2-0c5e771cbc49"
            ],
            "vehicle_types": [
              "bicycle",
              "scooter"
            ]
          }
        ],
        "end_date": null,
        "policy_id": "59f25ae6-3ec7-4642-a594-f8d2f6d97362",
        "start_date": 1558389669540,
        "description": "Mobility caps as described in the One-Year Permit",
        "provider_ids": [
          "3c95765d-4da6-41c6-b61e-1954472ec6c9"
        ],
        "publish_date": 1566937010395,
        "prev_policies": null
      },
      {
        "name": "LADOT Mobility Caps: Bird",
        "rules": [
          {
            "name": "SFV DACs",
            "maximum": 1000,
            "rule_id": "8a61de66-d9fa-4cba-a38d-5d948e2373fe",
            "statuses": {
              "trip": [],
              "reserved": [],
              "available": [],
              "unavailable": []
            },
            "rule_type": "count",
            "geographies": [
              "e3ed0a0e-61d3-4887-8b6a-4af4f3769c14"
            ],
            "vehicle_types": [
              "bicycle",
              "scooter"
            ]
          },
          {
            "name": "All other DACs",
            "maximum": 2500,
            "rule_id": "0a11a5d0-06ad-45d8-b4ba-c53f24744ff5",
            "statuses": {
              "trip": [],
              "reserved": [],
              "available": [],
              "unavailable": []
            },
            "rule_type": "count",
            "geographies": [
              "0c444869-1674-4234-b4f3-ab5685bcf0d9"
            ],
            "vehicle_types": [
              "bicycle",
              "scooter"
            ]
          },
          {
            "name": "Non-DAC",
            "maximum": 3000,
            "rule_id": "57d47e74-6aef-4f41-b0c5-79bb35aa5b9d",
            "statuses": {
              "trip": [],
              "reserved": [],
              "available": [],
              "unavailable": []
            },
            "rule_type": "count",
            "geographies": [
              "1f943d59-ccc9-4d91-b6e2-0c5e771cbc49"
            ],
            "vehicle_types": [
              "bicycle",
              "scooter"
            ]
          }
        ],
        "end_date": null,
        "policy_id": "99f7a469-6e3a-4981-9313-c2f6c0bbd5ce",
        "start_date": 1558389669540,
        "description": "Mobility caps as described in the One-Year Permit",
        "provider_ids": [
          "2411d395-04f2-47c9-ab66-d09e9e3c3251"
        ],
        "publish_date": 1566852448978,
        "prev_policies": null
      },
      {
        "name": "Hollywood Boulevard SOZ",
        "rules": [
          {
            "name": "No reserving, no starting trips, no ending trips, no deployments allowed in Hollywood Blvd SOZ",
            "maximum": 0,
            "rule_id": "0b472d99-2288-42fd-af9e-8256f9236285",
            "statuses": {
              "trip": [
                "trip_start",
                "trip_enter"
              ],
              "reserved": [
                "reserve"
              ],
              "available": [
                "service_start",
                "trip_end",
                "provider_drop_off"
              ],
              "unavailable": [
                "service_end"
              ]
            },
            "rule_type": "count",
            "geographies": [
              "b1a89ba2-379e-400b-8028-a8d6e15e04df"
            ],
            "vehicle_types": [
              "bicycle",
              "scooter"
            ]
          }
        ],
        "end_date": null,
        "policy_id": "bc38628f-50c0-4d58-81d0-30c5318902da",
        "start_date": 1589587200000,
        "description": "No vehicles are allowed to start or end trips; Providers are not allowed to drop vehicles in this geography",
        "provider_ids": [
          "2411d395-04f2-47c9-ab66-d09e9e3c3251",
          "3291c288-c9c8-42f1-bc3e-8502b077cd7f",
          "63f13c48-34ff-49d2-aca7-cf6a5b6171c3",
          "e714f168-ce56-4b41-81b7-0b6a4bd26128",
          "3c95765d-4da6-41c6-b61e-1954472ec6c9",
          "70aa475d-1fcd-4504-b69c-2eeb2107f7be",
          "b79f8687-526d-4ae6-80bf-89b4c44dc071",
          "c20e08cf-8488-46a6-a66c-5d8fb827f7e0"
        ],
        "publish_date": 1589590778787,
        "prev_policies": [
          "1122031e-5dd8-4978-9e30-b77527561f62"
        ]
      },
      {
        "name": "LADOT Mobility Caps: Jump",
        "rules": [
          {
            "name": "SFV DACs",
            "maximum": 0,
            "rule_id": "734f5974-d153-4473-8eb5-e146dd38d70b",
            "statuses": {
              "trip": [],
              "reserved": [],
              "available": [],
              "unavailable": []
            },
            "rule_type": "count",
            "geographies": [
              "e3ed0a0e-61d3-4887-8b6a-4af4f3769c14"
            ],
            "vehicle_types": [
              "bicycle",
              "scooter"
            ]
          },
          {
            "name": "All other DACs (bikes)",
            "maximum": 1250,
            "rule_id": "ccd6b299-5c58-412a-ae9d-75f1e077dc1d",
            "statuses": {
              "trip": [],
              "reserved": [],
              "available": [],
              "unavailable": []
            },
            "rule_type": "count",
            "geographies": [
              "0c444869-1674-4234-b4f3-ab5685bcf0d9"
            ],
            "vehicle_types": [
              "bicycle"
            ]
          },
          {
            "name": "All other DACs (scooters)",
            "maximum": 1250,
            "rule_id": "4c78e8dd-fec9-4a09-8807-b1f16a1adbbc",
            "statuses": {
              "trip": [],
              "reserved": [],
              "available": [],
              "unavailable": []
            },
            "rule_type": "count",
            "geographies": [
              "0c444869-1674-4234-b4f3-ab5685bcf0d9"
            ],
            "vehicle_types": [
              "scooter"
            ]
          },
          {
            "name": "Non-DAC",
            "maximum": 1500,
            "rule_id": "9680ec38-90c7-43dc-880d-4c4b9cd1f81a",
            "statuses": {
              "trip": [],
              "reserved": [],
              "available": [],
              "unavailable": []
            },
            "rule_type": "count",
            "geographies": [
              "1f943d59-ccc9-4d91-b6e2-0c5e771cbc49"
            ],
            "vehicle_types": [
              "bicycle"
            ]
          },
          {
            "name": "Non-DAC",
            "maximum": 1500,
            "rule_id": "dacb5dec-ea0c-4155-bb46-7b4b392d5291",
            "statuses": {
              "trip": [],
              "reserved": [],
              "available": [],
              "unavailable": []
            },
            "rule_type": "count",
            "geographies": [
              "1f943d59-ccc9-4d91-b6e2-0c5e771cbc49"
            ],
            "vehicle_types": [
              "scooter"
            ]
          }
        ],
        "end_date": null,
        "policy_id": "221efc03-c3ad-4868-b628-eef93f05e1d6",
        "start_date": 1558389669540,
        "description": "Mobility caps as described in the One-Year Permit",
        "provider_ids": [
          "c20e08cf-8488-46a6-a66c-5d8fb827f7e0"
        ],
        "publish_date": 1566936731809,
        "prev_policies": null
      },
      {
        "name": "LADOT Mobility Caps: Lyft",
        "rules": [
          {
            "name": "SFV DACs",
            "maximum": 500,
            "rule_id": "42938a11-db1e-4c38-84f8-fe4406f4b310",
            "statuses": {
              "trip": [],
              "reserved": [],
              "available": [],
              "unavailable": []
            },
            "rule_type": "count",
            "geographies": [
              "e3ed0a0e-61d3-4887-8b6a-4af4f3769c14"
            ],
            "vehicle_types": [
              "bicycle",
              "scooter"
            ]
          },
          {
            "name": "All other DACs (scooters)",
            "maximum": 500,
            "rule_id": "9d9e3d55-866e-47d2-a0a5-af7b62aaef68",
            "statuses": {
              "trip": [],
              "reserved": [],
              "available": [],
              "unavailable": []
            },
            "rule_type": "count",
            "geographies": [
              "0c444869-1674-4234-b4f3-ab5685bcf0d9"
            ],
            "vehicle_types": [
              "bicycle",
              "scooter"
            ]
          },
          {
            "name": "Non-DAC",
            "maximum": 3000,
            "rule_id": "0dfcb73f-c4ab-40bd-bcbc-a6f3878e5350",
            "statuses": {
              "trip": [],
              "reserved": [],
              "available": [],
              "unavailable": []
            },
            "rule_type": "count",
            "geographies": [
              "1f943d59-ccc9-4d91-b6e2-0c5e771cbc49"
            ],
            "vehicle_types": [
              "bicycle",
              "scooter"
            ]
          }
        ],
        "end_date": null,
        "policy_id": "284a5199-365e-4b9d-b5d0-842ea7b1d4f7",
        "start_date": 1558389669540,
        "description": "Mobility caps as described in the One-Year Permit",
        "provider_ids": [
          "e714f168-ce56-4b41-81b7-0b6a4bd26128"
        ],
        "publish_date": 1566936940392,
        "prev_policies": null
      },
      {
        "name": "LADOT Mobility Caps: Spin",
        "rules": [
          {
            "name": "SFV DACs",
            "maximum": 5000,
            "rule_id": "05441326-d626-4817-96c5-54c046279ca6",
            "statuses": {
              "trip": [],
              "reserved": [],
              "available": [],
              "unavailable": []
            },
            "rule_type": "count",
            "geographies": [
              "e3ed0a0e-61d3-4887-8b6a-4af4f3769c14"
            ],
            "vehicle_types": [
              "bicycle",
              "scooter"
            ]
          },
          {
            "name": "All other DACs (scooters)",
            "maximum": 2500,
            "rule_id": "71267fb9-b319-4b0d-9544-36cc7eecbc6d",
            "statuses": {
              "trip": [],
              "reserved": [],
              "available": [],
              "unavailable": []
            },
            "rule_type": "count",
            "geographies": [
              "0c444869-1674-4234-b4f3-ab5685bcf0d9"
            ],
            "vehicle_types": [
              "bicycle",
              "scooter"
            ]
          },
          {
            "name": "Non-DAC",
            "maximum": 3000,
            "rule_id": "3a84a446-0354-4026-91cb-102d18bdf675",
            "statuses": {
              "trip": [],
              "reserved": [],
              "available": [],
              "unavailable": []
            },
            "rule_type": "count",
            "geographies": [
              "1f943d59-ccc9-4d91-b6e2-0c5e771cbc49"
            ],
            "vehicle_types": [
              "bicycle",
              "scooter"
            ]
          }
        ],
        "end_date": null,
        "policy_id": "784bb9d8-ae82-49a2-83f2-fe01c8e1bb7b",
        "start_date": 1558389669540,
        "description": "Mobility caps as described in the One-Year Permit",
        "provider_ids": [
          "70aa475d-1fcd-4504-b69c-2eeb2107f7be"
        ],
        "publish_date": 1566937070749,
        "prev_policies": null
      },
      {
        "name": "LADOT Mobility Caps: Wheels",
        "rules": [
          {
            "name": "SFV DACs",
            "maximum": 0,
            "rule_id": "f60af867-9241-4f53-8cfb-4c6c807679f2",
            "statuses": {
              "trip": [],
              "reserved": [],
              "available": [],
              "unavailable": []
            },
            "rule_type": "count",
            "geographies": [
              "e3ed0a0e-61d3-4887-8b6a-4af4f3769c14"
            ],
            "vehicle_types": [
              "bicycle",
              "scooter"
            ]
          },
          {
            "name": "All other DACs (scooters)",
            "maximum": 0,
            "rule_id": "c046953a-6b34-4a28-992d-e993232ffaa2",
            "statuses": {
              "trip": [],
              "reserved": [],
              "available": [],
              "unavailable": []
            },
            "rule_type": "count",
            "geographies": [
              "0c444869-1674-4234-b4f3-ab5685bcf0d9"
            ],
            "vehicle_types": [
              "bicycle",
              "scooter"
            ]
          },
          {
            "name": "Non-DAC",
            "maximum": 3000,
            "rule_id": "70958c50-aa35-4ac6-8905-850e97f40613",
            "statuses": {
              "trip": [],
              "reserved": [],
              "available": [],
              "unavailable": []
            },
            "rule_type": "count",
            "geographies": [
              "1f943d59-ccc9-4d91-b6e2-0c5e771cbc49"
            ],
            "vehicle_types": [
              "bicycle",
              "scooter"
            ]
          }
        ],
        "end_date": null,
        "policy_id": "65207595-dfdc-4653-bc4c-7cca29f69cb7",
        "start_date": 1558389669540,
        "description": "Mobility caps as described in the One-Year Permit",
        "provider_ids": [
          "b79f8687-526d-4ae6-80bf-89b4c44dc071"
        ],
        "publish_date": 1566937297829,
        "prev_policies": null
      },
      {
        "name": "Hollywood Boulevard SOZ (2 hour pick-up policy)",
        "rules": [
          {
            "name": "Provider must pickup violations within 2hrs",
            "maximum": 120,
            "rule_id": "83ca0ac2-ddcc-42e1-8a67-d8f5d17e1417",
            "statuses": {
              "reserved": [
                "reserve"
              ],
              "available": [
                "service_start",
                "trip_end",
                "provider_drop_off",
                "cancel_reservation"
              ],
              "unavailable": [
                "service_end"
              ]
            },
            "rule_type": "time",
            "rule_units": "minutes",
            "geographies": [
              "b1a89ba2-379e-400b-8028-a8d6e15e04df"
            ],
            "vehicle_types": [
              "bicycle",
              "scooter"
            ]
          }
        ],
        "end_date": null,
        "policy_id": "0aebcfba-4494-4e42-b0aa-1f66aa45b54e",
        "start_date": 1589587200000,
        "description": "Providers have 2 hours to pick up a vehicle if one should be found with any of the listed states",
        "provider_ids": [
          "2411d395-04f2-47c9-ab66-d09e9e3c3251",
          "3291c288-c9c8-42f1-bc3e-8502b077cd7f",
          "63f13c48-34ff-49d2-aca7-cf6a5b6171c3",
          "e714f168-ce56-4b41-81b7-0b6a4bd26128",
          "3c95765d-4da6-41c6-b61e-1954472ec6c9",
          "70aa475d-1fcd-4504-b69c-2eeb2107f7be",
          "b79f8687-526d-4ae6-80bf-89b4c44dc071",
          "c20e08cf-8488-46a6-a66c-5d8fb827f7e0"
        ],
        "publish_date": 1589590776767,
        "prev_policies": [
          "dab7e695-b0a4-4cb4-b78d-38a40ea57e8d"
        ]
      },
      {
        "name": "Deactivate: VSOZ: Non-dropzone Caps",
        "rules": [
          {
            "name": "Deactivate",
            "minimum": 0,
            "rule_id": "856bd363-e5dd-4adf-9114-981dcfe992c6",
            "statuses": {},
            "rule_type": "count",
            "geographies": [
              "6dc968c7-19f4-421c-b9d1-683dd3cdb632",
              "2a4fbdb9-ff76-4060-aa92-1d37e26732e8",
              "9bb19cd1-2530-4f7f-8de0-80e7326a3e32",
              "fe9c910a-7aca-4a42-9d63-e014b3c243d7",
              "7beb1d83-66e7-4654-8c6b-6710fa26d1bd",
              "c7553640-730f-4ae1-a422-68bac4b849cc",
              "e42f7e97-b5e6-4ebe-8ddc-05fc806ce54e",
              "b539054b-541a-43b3-a182-58a0bd0958fd",
              "73779ce8-e0fb-48c0-96ba-a1e7f7738279",
              "aa4dc424-09e4-48f3-8471-df5186927016",
              "f5f4a15d-447f-4969-aedb-a0e94ae5b183",
              "456c25f0-a9ce-4ff3-8610-3cee919a3539",
              "0a484e09-7a95-4e7d-86c7-a10a58268ee2",
              "06b4e69e-da53-4340-8354-5a2262034657",
              "b1fdf441-ce46-4f22-bb70-dd2e99df1001",
              "2166b7dd-10ab-4219-9921-0d8c0f082308",
              "86f9a2bd-48c8-4447-b6eb-60916da16aa1",
              "d5d889c5-b6b9-4b83-bbcb-f5209d8dbcc3",
              "5a5b5ffa-5f9f-4db8-ba09-72c5deaac41a",
              "8ce201f3-34d7-46a2-aed3-282fcb6938ac",
              "2d7f76f0-f45e-4563-8be1-280f77b1181a",
              "9912fa40-b594-492f-91d0-113a7568bb2b"
            ]
          }
        ],
        "end_date": null,
        "policy_id": "d554bb63-99fa-4be6-91f0-d31061306ee9",
        "start_date": 1602776907294,
        "description": "Deactivates policy 64c1adb3-67df-4888-98ac-70598173cc21",
        "publish_date": 1602776807425,
        "prev_policies": [
          "64c1adb3-67df-4888-98ac-70598173cc21"
        ]
      },
      {
        "name": "Deactivate: VSOZ: Drop-off Caps",
        "rules": [
          {
            "name": "Deactivate",
            "minimum": 0,
            "rule_id": "5bf1552f-5448-4ba2-9f4d-70399d09bcbc",
            "statuses": {},
            "rule_type": "count",
            "geographies": [
              "6dc968c7-19f4-421c-b9d1-683dd3cdb632",
              "2a4fbdb9-ff76-4060-aa92-1d37e26732e8",
              "9bb19cd1-2530-4f7f-8de0-80e7326a3e32",
              "fe9c910a-7aca-4a42-9d63-e014b3c243d7",
              "7beb1d83-66e7-4654-8c6b-6710fa26d1bd",
              "c7553640-730f-4ae1-a422-68bac4b849cc",
              "e42f7e97-b5e6-4ebe-8ddc-05fc806ce54e",
              "b539054b-541a-43b3-a182-58a0bd0958fd",
              "73779ce8-e0fb-48c0-96ba-a1e7f7738279",
              "aa4dc424-09e4-48f3-8471-df5186927016",
              "f5f4a15d-447f-4969-aedb-a0e94ae5b183",
              "456c25f0-a9ce-4ff3-8610-3cee919a3539",
              "0a484e09-7a95-4e7d-86c7-a10a58268ee2",
              "06b4e69e-da53-4340-8354-5a2262034657",
              "b1fdf441-ce46-4f22-bb70-dd2e99df1001",
              "2166b7dd-10ab-4219-9921-0d8c0f082308",
              "86f9a2bd-48c8-4447-b6eb-60916da16aa1",
              "d5d889c5-b6b9-4b83-bbcb-f5209d8dbcc3",
              "5a5b5ffa-5f9f-4db8-ba09-72c5deaac41a",
              "8ce201f3-34d7-46a2-aed3-282fcb6938ac",
              "2d7f76f0-f45e-4563-8be1-280f77b1181a",
              "9912fa40-b594-492f-91d0-113a7568bb2b",
              "fb411640-0220-43f4-bfc7-6f01350dadfe",
              "45e85d25-a1bd-4972-9871-d7762e1ffe8f",
              "2aa25299-514e-4b3f-9828-533649ceff2e",
              "e1d54dc4-9466-4d7b-bcf2-e873716d0a7b"
            ]
          }
        ],
        "end_date": null,
        "policy_id": "ac39bb06-97cd-4a63-b10d-4832e34792ff",
        "start_date": 1602776918825,
        "description": "Deactivates policy 56e0be92-1cfd-4016-8fcc-11c0b347ee83",
        "provider_ids": null,
        "publish_date": 1602776818949,
        "prev_policies": [
          "56e0be92-1cfd-4016-8fcc-11c0b347ee83"
        ]
      },
      {
        "name": "Deactivate: VSOZ: Measure Drop-offs",
        "rules": [
          {
            "name": "Deactivate",
            "minimum": 0,
            "rule_id": "d9bba683-a150-4020-97a4-cbaaacfcc7b2",
            "statuses": {},
            "rule_type": "count",
            "geographies": [
              "e0e4a085-7a50-43e0-afa4-6792ca897c5a"
            ]
          }
        ],
        "end_date": null,
        "policy_id": "b763a6eb-d929-4cc0-afa7-bbff02d658fe",
        "start_date": 1602776935443,
        "description": "Deactivates policy 362d8826-e894-4ef8-b57e-97e03acc84ef",
        "provider_ids": null,
        "publish_date": 1602776835568,
        "prev_policies": [
          "362d8826-e894-4ef8-b57e-97e03acc84ef"
        ]
      },
      {
        "name": "Deactivate: LADOT Venice Beach Special Operations Zone Global Caps",
        "rules": [
          {
            "name": "Deactivate",
            "minimum": 0,
            "rule_id": "5bf3ace2-5870-4f61-9efd-9f45f0cb5d7f",
            "statuses": {},
            "rule_type": "count",
            "geographies": [
              "e0e4a085-7a50-43e0-afa4-6792ca897c5a"
            ]
          }
        ],
        "end_date": null,
        "policy_id": "268e3dc1-287e-49d2-9d11-38292aec4a17",
        "start_date": 1602776958219,
        "description": "Deactivates policy 16e3fca1-f771-440d-9f9c-713e364ffbf5",
        "publish_date": 1602776858335,
        "prev_policies": [
          "16e3fca1-f771-440d-9f9c-713e364ffbf5"
        ]
      },
      {
        "name": "Venice Special Operating Zone: Operator Fleet Cap",
        "rules": [
          {
            "name": "Venice Beach SOZ: Operator Fleet Cap",
            "maximum": 150,
            "rule_id": "8e3b9bc7-7256-489f-954b-5adaa00ecbd7",
            "statuses": {
              "reserved": [],
              "available": []
            },
            "rule_type": "count",
            "geographies": [
              "e0e4a085-7a50-43e0-afa4-6792ca897c5a"
            ],
            "vehicle_types": [
              "scooter",
              "bicycle"
            ]
          }
        ],
        "end_date": null,
        "policy_id": "31b06f93-9c4a-4e5b-bf46-4bd484b547df",
        "start_date": 1602745200000,
        "description": "Fleet caps for all operators in the Venice Special Operating Zone",
        "provider_ids": [],
        "publish_date": 1602708954494,
        "prev_policies": null
      },
      {
        "name": "Deactivate: LADOT Venice Global Caps",
        "rules": [
          {
            "name": "Deactivate",
            "minimum": 0,
            "rule_id": "56bdbb97-2ea7-4ccd-821c-0e38c9afd567",
            "statuses": {},
            "rule_type": "count",
            "geographies": [
              "3abf8e10-a380-45bb-bfd4-ec5b21b1b0b6"
            ]
          }
        ],
        "end_date": null,
        "policy_id": "ffaea2d5-2183-48df-affb-59a169e73626",
        "start_date": 1602776976455,
        "description": "Deactivates policy 808f7c4e-83e2-456d-9e49-655a461d393f",
        "publish_date": 1602776876593,
        "prev_policies": [
          "808f7c4e-83e2-456d-9e49-655a461d393f"
        ]
      },
      {
        "name": "Venice Special Operations Zone: Morning Deployment Policy",
        "rules": [
          {
            "name": "Morning deployment drop off caps",
            "maximum": 5,
            "rule_id": "152fe364-9b8d-425c-94c9-b201aa060ca9",
            "end_time": "10:00:00",
            "statuses": {
              "available": [
                "provider_drop_off",
                "service_start"
              ]
            },
            "rule_type": "count",
            "start_time": "05:00:00",
            "geographies": [
              "6dc968c7-19f4-421c-b9d1-683dd3cdb632",
              "aa4dc424-09e4-48f3-8471-df5186927016",
              "f5f4a15d-447f-4969-aedb-a0e94ae5b183",
              "fb411640-0220-43f4-bfc7-6f01350dadfe",
              "456c25f0-a9ce-4ff3-8610-3cee919a3539",
              "0a484e09-7a95-4e7d-86c7-a10a58268ee2",
              "06b4e69e-da53-4340-8354-5a2262034657",
              "b1fdf441-ce46-4f22-bb70-dd2e99df1001",
              "2166b7dd-10ab-4219-9921-0d8c0f082308",
              "86f9a2bd-48c8-4447-b6eb-60916da16aa1",
              "d5d889c5-b6b9-4b83-bbcb-f5209d8dbcc3",
              "5a5b5ffa-5f9f-4db8-ba09-72c5deaac41a",
              "2a4fbdb9-ff76-4060-aa92-1d37e26732e8",
              "8ce201f3-34d7-46a2-aed3-282fcb6938ac",
              "2d7f76f0-f45e-4563-8be1-280f77b1181a",
              "45e85d25-a1bd-4972-9871-d7762e1ffe8f",
              "9912fa40-b594-492f-91d0-113a7568bb2b",
              "e1d54dc4-9466-4d7b-bcf2-e873716d0a7b",
              "9bb19cd1-2530-4f7f-8de0-80e7326a3e32",
              "2aa25299-514e-4b3f-9828-533649ceff2e",
              "fe9c910a-7aca-4a42-9d63-e014b3c243d7",
              "7beb1d83-66e7-4654-8c6b-6710fa26d1bd",
              "c7553640-730f-4ae1-a422-68bac4b849cc",
              "e42f7e97-b5e6-4ebe-8ddc-05fc806ce54e",
              "b539054b-541a-43b3-a182-58a0bd0958fd",
              "73779ce8-e0fb-48c0-96ba-a1e7f7738279"
            ],
            "vehicle_types": [
              "bicycle",
              "scooter"
            ]
          }
        ],
        "end_date": null,
        "policy_id": "7aa08efa-7b55-4fa9-a20b-d4b106216fc6",
        "start_date": 1602745200000,
        "description": "Operators are authorized to begin daily deployment only between the hours of 5:00 a.m. to 10:00 a.m., daily, AND are authorized to deploy up to a maximum of 5 vehicles per parking zone.",
        "provider_ids": [],
        "publish_date": 1602708957081,
        "prev_policies": null
      },
      {
        "name": "Venice Beach Walk Streets: 5 mph speed limit",
        "rules": [
          {
            "name": "Venice Beach Walk Streets: 5 mph speed limit",
            "maximum": 5,
            "rule_id": "ca836b91-8797-4ff3-8733-b39f8286d20b",
            "statuses": {},
            "rule_type": "speed",
            "rule_units": "mph",
            "geographies": [
              "5834b884-a547-47c0-8836-366756d9b648"
            ],
            "vehicle_types": [
              "bicycle",
              "scooter"
            ]
          }
        ],
        "end_date": null,
        "policy_id": "33643419-243a-45fe-a7a0-a612d2f3d4c9",
        "start_date": 1602745200000,
        "description": "Venice Beach Walk Streets: 5 mph speed limit on certain locations",
        "provider_ids": [],
        "publish_date": 1602708940022,
        "prev_policies": null
      },
      {
        "name": "Venice Beach Walk Streets: Ride-through only",
        "rules": [
          {
            "name": "No start/end trips, no fleet deployments",
            "minimum": 0,
            "rule_id": "62fb7bc0-3190-404a-bffe-4d3163888bee",
            "statuses": {
              "trip": [],
              "reserved": [],
              "available": [],
              "unavailable": []
            },
            "rule_type": "count",
            "geographies": [
              "8e2c6043-8b9a-431b-95ba-9c5f37152e3d"
            ],
            "vehicle_types": [
              "bicycle",
              "scooter"
            ]
          }
        ],
        "end_date": null,
        "policy_id": "c48c9266-d6c7-42ab-99a3-9c91d0918ebf",
        "start_date": 1602745200000,
        "description": "Venice Beach Walk Streets: Ride-through only,  no start/end trips, no fleet deployments",
        "provider_ids": [],
        "publish_date": 1602708947744,
        "prev_policies": null
      },
      {
        "name": "Venice Special Operating Zone: Operator Deploy and Rebalance in Parking Zones Only",
        "rules": [
          {
            "name": "Deploy or rebalance into parking zones only",
            "minimum": 0,
            "rule_id": "eae966d1-f191-42c0-bddb-a8a1c6e8abeb",
            "statuses": {
              "available": [
                "provider_drop_off",
                "service_start"
              ]
            },
            "rule_type": "count",
            "geographies": [
              "6dc968c7-19f4-421c-b9d1-683dd3cdb632",
              "aa4dc424-09e4-48f3-8471-df5186927016",
              "f5f4a15d-447f-4969-aedb-a0e94ae5b183",
              "456c25f0-a9ce-4ff3-8610-3cee919a3539",
              "fb411640-0220-43f4-bfc7-6f01350dadfe",
              "0a484e09-7a95-4e7d-86c7-a10a58268ee2",
              "06b4e69e-da53-4340-8354-5a2262034657",
              "b1fdf441-ce46-4f22-bb70-dd2e99df1001",
              "2166b7dd-10ab-4219-9921-0d8c0f082308",
              "86f9a2bd-48c8-4447-b6eb-60916da16aa1",
              "d5d889c5-b6b9-4b83-bbcb-f5209d8dbcc3",
              "5a5b5ffa-5f9f-4db8-ba09-72c5deaac41a",
              "2a4fbdb9-ff76-4060-aa92-1d37e26732e8",
              "8ce201f3-34d7-46a2-aed3-282fcb6938ac",
              "2d7f76f0-f45e-4563-8be1-280f77b1181a",
              "45e85d25-a1bd-4972-9871-d7762e1ffe8f",
              "9912fa40-b594-492f-91d0-113a7568bb2b",
              "e1d54dc4-9466-4d7b-bcf2-e873716d0a7b",
              "9bb19cd1-2530-4f7f-8de0-80e7326a3e32",
              "2aa25299-514e-4b3f-9828-533649ceff2e",
              "fe9c910a-7aca-4a42-9d63-e014b3c243d7",
              "7beb1d83-66e7-4654-8c6b-6710fa26d1bd",
              "c7553640-730f-4ae1-a422-68bac4b849cc",
              "e42f7e97-b5e6-4ebe-8ddc-05fc806ce54e",
              "b539054b-541a-43b3-a182-58a0bd0958fd",
              "73779ce8-e0fb-48c0-96ba-a1e7f7738279"
            ],
            "vehicle_types": [
              "bicycle",
              "scooter"
            ]
          },
          {
            "name": "No deployments or rebalancing outside of parking zones",
            "maximum": 0,
            "rule_id": "98f16817-1a93-49b0-806e-fc35393bcfd4",
            "statuses": {
              "available": [
                "provider_drop_off"
              ]
            },
            "rule_type": "count",
            "geographies": [
              "e0e4a085-7a50-43e0-afa4-6792ca897c5a"
            ],
            "vehicle_types": [
              "bicycle",
              "scooter"
            ]
          }
        ],
        "end_date": null,
        "policy_id": "8b02ec1e-9316-4b38-b331-701d1003fda8",
        "start_date": 1602745200000,
        "description": "Each Operator is authorized to deploy or rebalance vehicles only into LADOT-identified parking zones, including digital parking zones",
        "provider_ids": [],
        "publish_date": 1602708951570,
        "prev_policies": null
      }
    ]

const ids = [
  'a2885805-a3db-4dbc-915f-c2555707c24c',
  '92081b54-d23b-4084-9ce2-0212b2806135',
  'f09ad24a-ad0e-4fb0-8770-4fd24e06eb2c',
  '29abff63-4d87-43d3-b702-1d9eb316336e',
  '59f25ae6-3ec7-4642-a594-f8d2f6d97362',
  '99f7a469-6e3a-4981-9313-c2f6c0bbd5ce',
  'bc38628f-50c0-4d58-81d0-30c5318902da',
  '221efc03-c3ad-4868-b628-eef93f05e1d6',
  '284a5199-365e-4b9d-b5d0-842ea7b1d4f7',
  '784bb9d8-ae82-49a2-83f2-fe01c8e1bb7b',
  '65207595-dfdc-4653-bc4c-7cca29f69cb7',
  'eb767239-0a92-4b27-a1f5-643bc75d7025',
  'bd0a04ff-d96a-4361-9ad2-bdcc2b194867',
  '0aebcfba-4494-4e42-b0aa-1f66aa45b54e',
  'd554bb63-99fa-4be6-91f0-d31061306ee9',
  'ac39bb06-97cd-4a63-b10d-4832e34792ff',
  'b763a6eb-d929-4cc0-afa7-bbff02d658fe',
  '268e3dc1-287e-49d2-9d11-38292aec4a17',
  '31b06f93-9c4a-4e5b-bf46-4bd484b547df',
  'ffaea2d5-2183-48df-affb-59a169e73626',
  '7aa08efa-7b55-4fa9-a20b-d4b106216fc6',
  '33643419-243a-45fe-a7a0-a612d2f3d4c9',
  'c48c9266-d6c7-42ab-99a3-9c91d0918ebf',
  '8b02ec1e-9316-4b38-b331-701d1003fda8'
]

 import { FULL_STATE_MAPPING_v0_4_1_to_v1_0_0 } from './packages/mds-types/transformers/0_4_1_to_1_0_0'
import { VEHICLE_EVENT_v0_4_1 } from './packages/mds-types/transformers/@types'
type INGESTABLE_VEHICLE_EVENT = Exclude<VEHICLE_EVENT_v0_4_1, 'register'>
import { VehicleEvent_v1_0_0, VEHICLE_EVENT_v1_0_0, VEHICLE_STATE_v1_0_0 } from './packages/mds-types/transformers/@types/1_0_0'

const active_policies = policies.filter(p => ids.includes(p.policy_id)) 


export const STATES_MAPPING: { [key:string]: string } = { 
    available: 'available',
    elsewhere: 'elsewhere',
    reserved: 'reserved',
    removed: 'removed',
    trip: 'on_trip',
    inactive: 'unknown',
    unavailable: 'non_operational',
    
}

interface Rule {
    statuses: { [key: string]: INGESTABLE_VEHICLE_EVENT[] }
    [key: string]: any
}

 function transform_rule_statuses(rule: Rule) {
    const states: { [key: string]: any } = {}
    Object.keys(rule.statuses).forEach(status => {
            let candidate_state = 'unknown'
            const new_event_types: VEHICLE_EVENT_v1_0_0[] = (rule.statuses[status]).map((event_type) => {
                candidate_state = FULL_STATE_MAPPING_v0_4_1_to_v1_0_0[event_type]['no_event_type_reason'].vehicle_state
                const new_event_type = FULL_STATE_MAPPING_v0_4_1_to_v1_0_0[event_type]['no_event_type_reason'].event_type
                if (new_event_type === 'maintenance') {
                    return 'off_hours'
                }
                return new_event_type
                    })
            if (!!STATES_MAPPING[status] && STATES_MAPPING[status] !== 'unknown') {
                const state = STATES_MAPPING[status] 
                states[state] = new_event_types
                } else {

                    states[candidate_state] = new_event_types
                }
            })
    return states
 }

 function transform(policy: any) {
     policy.rules.forEach((rule: any) => {
        
        const states = transform_rule_statuses(rule)
        delete rule.statuses
        rule.states = states
             })
    
    return policy
 }

// const processed = active_policies.map(p => {
// //    console.dir(p, { depth:  null })
//     const policy = transform(p)
//     console.dir(policy, { depth: null })
//     console.log(',')
//     return [p, policy]
//         })



/*
const fs = require('fs')
console.log('logging')
fs.writeFileSync('/Users/jane/work/mds-core/all-policies', JSON.stringify(processed), (err: any) => {
    console.log(err)
        })
*/
