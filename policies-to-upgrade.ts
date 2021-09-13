/* eslint-disable */
const policies_prod = [
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

const policies_sandbox = [
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
    "publish_date": 1567114161017,
    "prev_policies": null
  },
  {
    "name": "dddd",
    "rules": [
      {
        "name": "feaw",
        "minimum": 0,
        "rule_id": "e00bc8b9-854c-4b3d-9ff2-1906d827b5df",
        "statuses": {},
        "rule_type": "count",
        "geographies": [
          "88476666-2c50-4ff4-9530-1758befa9319"
        ],
        "vehicle_types": []
      }
    ],
    "end_date": null,
    "policy_id": "7ce64e36-ecf7-48ef-a4de-880b44f8dd67",
    "start_date": 1572591600000,
    "description": "asdf",
    "provider_ids": [],
    "publish_date": 1572543781957,
    "prev_policies": null
  },
  {
    "name": "dddda",
    "rules": [
      {
        "name": "feaw",
        "minimum": 0,
        "rule_id": "0a621c33-1b48-4097-8d48-9dc60c7389c3",
        "statuses": {},
        "rule_type": "count",
        "geographies": [
          "88476666-2c50-4ff4-9530-1758befa9319"
        ],
        "vehicle_types": []
      }
    ],
    "end_date": null,
    "policy_id": "b2c0821b-9381-48f7-b3ed-b5c0a1218e63",
    "start_date": 1572591600000,
    "description": "asdf",
    "provider_ids": [],
    "publish_date": 1572544050475,
    "prev_policies": null
  },
  {
    "name": "dddd m",
    "rules": [
      {
        "name": "asdf",
        "minimum": 0,
        "rule_id": "26734731-8e51-4ec9-8c2f-814387dbdce0",
        "statuses": {},
        "rule_type": "count",
        "geographies": [
          "48bd78cf-262b-44d5-83ba-3697d29e1d22"
        ],
        "vehicle_types": []
      }
    ],
    "end_date": null,
    "policy_id": "04a468e8-bd4f-46af-bf93-3d7d53592156",
    "start_date": 1572591600000,
    "description": "asd",
    "provider_ids": [],
    "publish_date": 1572590929665,
    "prev_policies": null
  },
  {
    "name": "Deactivate: azeaze",
    "rules": [
      {
        "name": "Deactivate",
        "minimum": 0,
        "rule_id": "71190624-79df-4b67-a3df-7e6f3615a9cc",
        "statuses": {},
        "rule_type": "count",
        "geographies": [
          "b8064e87-08d9-448e-84df-1313caa61572"
        ]
      }
    ],
    "end_date": null,
    "policy_id": "c22325b4-e6bf-4507-944c-cd64f504d1fd",
    "start_date": 1627598093867,
    "description": "Deactivates policy 6866a655-090f-43e6-924f-f98609fa1457",
    "provider_ids": [
      "07975cc8-c8c4-4544-9090-082e03477633",
      "1239e0ad-c115-44cd-9ee3-e03ac4faa79a",
      "7514fb21-ff10-478e-9183-6a6bfb38f9ac",
      "9bf0b395-012a-4566-ab15-a475e35d0af2"
    ],
    "publish_date": 1627597994029,
    "prev_policies": [
      "6866a655-090f-43e6-924f-f98609fa1457"
    ]
  },
  {
    "name": "Deactivate: LADOT Mobility Caps: Bird",
    "rules": [
      {
        "name": "Deactivate",
        "minimum": 0,
        "rule_id": "d27e9fc5-9e4e-4529-8772-c034f6bb294b",
        "statuses": {},
        "rule_type": "count",
        "geographies": [
          "e3ed0a0e-61d3-4887-8b6a-4af4f3769c14"
        ]
      }
    ],
    "end_date": null,
    "policy_id": "20f61d4a-c46e-47ed-b305-2cec3977a863",
    "start_date": 1567119739654,
    "description": "Deactivates policy 8de0e9fd-5686-484c-9e59-7f8223dba048",
    "provider_ids": [
      "2411d395-04f2-47c9-ab66-d09e9e3c3251"
    ],
    "publish_date": 1567119739954,
    "prev_policies": [
      "8de0e9fd-5686-484c-9e59-7f8223dba048"
    ]
  },
  {
    "name": "Deactivate: LADOT Mobility Caps: Bolt",
    "rules": [
      {
        "name": "Deactivate",
        "minimum": 0,
        "rule_id": "d8a7fea6-8dc1-4a1e-b7bc-a3db6919ea44",
        "statuses": {},
        "rule_type": "count",
        "geographies": [
          "e3ed0a0e-61d3-4887-8b6a-4af4f3769c14"
        ]
      }
    ],
    "end_date": null,
    "policy_id": "66d9cfc3-c0b0-421e-b67d-3025c7a7e42d",
    "start_date": 1567119784621,
    "description": "Deactivates policy 4c1464b6-490e-4540-adbf-de7b98d8f9fd",
    "publish_date": 1567119784918,
    "prev_policies": [
      "4c1464b6-490e-4540-adbf-de7b98d8f9fd"
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
    "publish_date": 1568676382738,
    "prev_policies": null
  },
  {
    "name": "BLUE test: LADOT Mobility Caps: Bird",
    "rules": [
      {
        "name": "SFV DACs",
        "maximum": 0,
        "rule_id": "734f5974-d453-4473-8eb5-e146dd38d81b",
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
      }
    ],
    "end_date": null,
    "policy_id": "734f5974-d453-4473-8eb5-e146dd38d80b",
    "start_date": 1558389669540,
    "description": "Mobility caps as described in the One-Year Permit",
    "provider_ids": [
      "2411d395-04f2-47c9-ab66-d09e9e3c3251"
    ],
    "publish_date": 1568763364514
  },
  {
    "name": "Venice Special Operations Zone: Morning Deployment Policy (Revised July 2021)",
    "rules": [
      {
        "name": "Morning deployment drop off caps",
        "maximum": 5,
        "rule_id": "3adc55e8-b118-4edd-be70-012d38ece09a",
        "end_time": "10:00:00",
        "statuses": {
          "reserved": [],
          "available": []
        },
        "rule_type": "count",
        "start_time": "05:00:00",
        "geographies": [
          "6dc968c7-19f4-421c-b9d1-683dd3cdb632"
        ],
        "vehicle_types": [
          "bicycle",
          "scooter"
        ]
      },
      {
        "name": "Morning deployment drop off caps",
        "maximum": 5,
        "rule_id": "8f8e3eb0-be38-4d29-a884-f04a276e5b55",
        "end_time": "10:00:00",
        "statuses": {
          "reserved": [],
          "available": []
        },
        "rule_type": "count",
        "start_time": "05:00:00",
        "geographies": [
          "aa4dc424-09e4-48f3-8471-df5186927016"
        ],
        "vehicle_types": []
      },
      {
        "name": "Morning deployment drop off caps",
        "maximum": 5,
        "rule_id": "2d03ec89-ed19-47ee-b54e-cb03e39903a9",
        "end_time": "10:00:00",
        "statuses": {
          "reserved": [],
          "available": []
        },
        "rule_type": "count",
        "start_time": "05:00:00",
        "geographies": [
          "f5f4a15d-447f-4969-aedb-a0e94ae5b183"
        ],
        "vehicle_types": []
      },
      {
        "name": "Morning deployment drop off caps",
        "maximum": 5,
        "rule_id": "ebeeb7e9-dc62-484d-b0dd-d0801f0a1a2d",
        "end_time": "10:00:00",
        "statuses": {
          "reserved": [],
          "available": []
        },
        "rule_type": "count",
        "start_time": "05:00:00",
        "geographies": [
          "fb411640-0220-43f4-bfc7-6f01350dadfe"
        ],
        "vehicle_types": []
      },
      {
        "name": "Morning deployment drop off caps",
        "maximum": 5,
        "rule_id": "fc4cbc35-3a21-4103-811a-b4dfa3d30a77",
        "end_time": "10:00:00",
        "statuses": {
          "reserved": [],
          "available": []
        },
        "rule_type": "count",
        "start_time": "05:00:00",
        "geographies": [
          "456c25f0-a9ce-4ff3-8610-3cee919a3539"
        ],
        "vehicle_types": []
      },
      {
        "name": "Morning deployment drop off caps",
        "maximum": 5,
        "rule_id": "ed0f9008-566a-4a4e-9077-80f38703666d",
        "end_time": "10:00:00",
        "statuses": {
          "reserved": [],
          "available": []
        },
        "rule_type": "count",
        "start_time": "05:00:00",
        "geographies": [
          "0a484e09-7a95-4e7d-86c7-a10a58268ee2"
        ],
        "vehicle_types": []
      },
      {
        "name": "Morning deployment drop off caps",
        "maximum": 5,
        "rule_id": "614c2bf9-89d0-42f5-a627-8a33d9749c74",
        "end_time": "10:00:00",
        "statuses": {
          "reserved": [],
          "available": []
        },
        "rule_type": "count",
        "start_time": "05:00:00",
        "geographies": [
          "06b4e69e-da53-4340-8354-5a2262034657"
        ],
        "vehicle_types": []
      },
      {
        "name": "Morning deployment drop off caps",
        "maximum": 5,
        "rule_id": "5b57b9f4-14ac-4ec0-ba9b-d7c6fa866e07",
        "end_time": "10:00:00",
        "statuses": {
          "reserved": [],
          "available": []
        },
        "rule_type": "count",
        "start_time": "05:00:00",
        "geographies": [
          "b1fdf441-ce46-4f22-bb70-dd2e99df1001"
        ],
        "vehicle_types": []
      },
      {
        "name": "Morning deployment drop off caps",
        "maximum": 5,
        "rule_id": "ef07f938-7a5b-4edb-9906-c23c927c94bd",
        "end_time": "10:00:00",
        "statuses": {},
        "rule_type": "count",
        "start_time": "05:00:00",
        "geographies": [
          "2166b7dd-10ab-4219-9921-0d8c0f082308"
        ],
        "vehicle_types": []
      },
      {
        "name": "Morning deployment drop off caps",
        "maximum": 5,
        "rule_id": "55db5782-5943-4323-8fce-f01ba40fdc2e",
        "end_time": "10:00:00",
        "statuses": {
          "reserved": [],
          "available": []
        },
        "rule_type": "count",
        "start_time": "05:00:00",
        "geographies": [
          "86f9a2bd-48c8-4447-b6eb-60916da16aa1"
        ],
        "vehicle_types": []
      },
      {
        "name": "Morning deployment drop off caps",
        "maximum": 5,
        "rule_id": "caffbc26-2ad7-4d1f-b69a-7d6f8ee5aab6",
        "end_time": "10:00:00",
        "statuses": {
          "reserved": [],
          "available": []
        },
        "rule_type": "count",
        "start_time": "05:00:00",
        "geographies": [
          "d5d889c5-b6b9-4b83-bbcb-f5209d8dbcc3"
        ],
        "vehicle_types": []
      },
      {
        "name": "Morning deployment drop off caps",
        "maximum": 5,
        "rule_id": "15f5712e-9966-43c8-9e41-1774f2f5c30e",
        "end_time": "10:00:00",
        "statuses": {
          "reserved": [],
          "available": []
        },
        "rule_type": "count",
        "start_time": "05:00:00",
        "geographies": [
          "5a5b5ffa-5f9f-4db8-ba09-72c5deaac41a"
        ],
        "vehicle_types": []
      },
      {
        "name": "Morning deployment drop off caps",
        "maximum": 5,
        "rule_id": "8f46b984-ed44-40ff-b497-659d4f7e253d",
        "end_time": "10:00:00",
        "statuses": {
          "reserved": [],
          "available": []
        },
        "rule_type": "count",
        "start_time": "05:00:00",
        "geographies": [
          "2a4fbdb9-ff76-4060-aa92-1d37e26732e8"
        ],
        "vehicle_types": []
      },
      {
        "name": "Morning deployment drop off caps",
        "maximum": 5,
        "rule_id": "11cdd24f-5721-4148-93b3-c4348de64766",
        "end_time": "10:00:00",
        "statuses": {
          "reserved": [],
          "available": []
        },
        "rule_type": "count",
        "start_time": "05:00:00",
        "geographies": [
          "8ce201f3-34d7-46a2-aed3-282fcb6938ac"
        ],
        "vehicle_types": []
      },
      {
        "name": "Morning deployment drop off caps",
        "maximum": 5,
        "rule_id": "108e5675-2762-44ec-921e-b6c497b95088",
        "end_time": "10:00:00",
        "statuses": {
          "reserved": [],
          "available": []
        },
        "rule_type": "count",
        "start_time": "05:00:00",
        "geographies": [
          "2d7f76f0-f45e-4563-8be1-280f77b1181a"
        ],
        "vehicle_types": []
      },
      {
        "name": "Morning deployment drop off caps",
        "maximum": 5,
        "rule_id": "0f1c090d-98dd-462c-9c7c-b795536c4512",
        "end_time": "10:00:00",
        "statuses": {
          "reserved": [],
          "available": []
        },
        "rule_type": "count",
        "start_time": "05:00:00",
        "geographies": [
          "45e85d25-a1bd-4972-9871-d7762e1ffe8f"
        ],
        "vehicle_types": []
      },
      {
        "name": "Morning deployment drop off caps",
        "maximum": 5,
        "rule_id": "18b8a0cd-6844-4b52-9229-0950f7fafb63",
        "end_time": "10:00:00",
        "statuses": {
          "reserved": [],
          "available": []
        },
        "rule_type": "count",
        "start_time": "05:00:00",
        "geographies": [
          "9912fa40-b594-492f-91d0-113a7568bb2b"
        ],
        "vehicle_types": []
      },
      {
        "name": "Morning deployment drop off caps",
        "maximum": 5,
        "rule_id": "c6868c75-b04f-48c3-b1e8-cf88b15f17d1",
        "end_time": "10:00:00",
        "statuses": {},
        "rule_type": "count",
        "start_time": "05:00:00",
        "geographies": [
          "e1d54dc4-9466-4d7b-bcf2-e873716d0a7b"
        ],
        "vehicle_types": []
      },
      {
        "name": "Morning deployment drop off caps",
        "maximum": 5,
        "rule_id": "77cef07b-7b55-4607-8ea5-31b070b8bf16",
        "end_time": "10:00:00",
        "statuses": {
          "reserved": [],
          "available": []
        },
        "rule_type": "count",
        "start_time": "05:00:00",
        "geographies": [
          "9bb19cd1-2530-4f7f-8de0-80e7326a3e32"
        ],
        "vehicle_types": []
      },
      {
        "name": "Morning deployment drop off caps",
        "maximum": 5,
        "rule_id": "4b3d3651-bc0e-46c4-b941-2b6bcd194fa6",
        "end_time": "10:00:00",
        "statuses": {
          "reserved": [],
          "available": []
        },
        "rule_type": "count",
        "start_time": "05:00:00",
        "geographies": [
          "2aa25299-514e-4b3f-9828-533649ceff2e"
        ],
        "vehicle_types": []
      },
      {
        "name": "Morning deployment drop off caps",
        "maximum": 5,
        "rule_id": "f745c292-6f9e-4380-af9d-92b91dc4a1fb",
        "end_time": "10:00:00",
        "statuses": {
          "reserved": [],
          "available": []
        },
        "rule_type": "count",
        "start_time": "05:00:00",
        "geographies": [
          "fe9c910a-7aca-4a42-9d63-e014b3c243d7"
        ],
        "vehicle_types": []
      },
      {
        "name": "Morning deployment drop off caps",
        "maximum": 5,
        "rule_id": "e0f0412b-6528-4ec2-b333-b53d11c1c643",
        "end_time": "10:00:00",
        "statuses": {
          "reserved": [],
          "available": []
        },
        "rule_type": "count",
        "start_time": "05:00:00",
        "geographies": [
          "7beb1d83-66e7-4654-8c6b-6710fa26d1bd"
        ],
        "vehicle_types": []
      },
      {
        "name": "Morning deployment drop off caps",
        "maximum": 5,
        "rule_id": "18624fa9-5fec-4482-a75e-656d348aa560",
        "end_time": "10:00:00",
        "statuses": {
          "reserved": [],
          "available": []
        },
        "rule_type": "count",
        "start_time": "05:00:00",
        "geographies": [
          "c7553640-730f-4ae1-a422-68bac4b849cc"
        ],
        "vehicle_types": []
      },
      {
        "name": "Morning deployment drop off caps",
        "maximum": 5,
        "rule_id": "14ce2955-ff69-4520-9c3b-70c2d246251f",
        "end_time": "10:00:00",
        "statuses": {
          "reserved": [],
          "available": []
        },
        "rule_type": "count",
        "start_time": "05:00:00",
        "geographies": [
          "e42f7e97-b5e6-4ebe-8ddc-05fc806ce54e"
        ],
        "vehicle_types": []
      },
      {
        "name": "Morning deployment drop off caps",
        "maximum": 5,
        "rule_id": "40f2eb2c-7c66-4c7c-aa05-f0af0984be5b",
        "end_time": "10:00:00",
        "statuses": {
          "reserved": [],
          "available": []
        },
        "rule_type": "count",
        "start_time": "05:00:00",
        "geographies": [
          "b539054b-541a-43b3-a182-58a0bd0958fd"
        ],
        "vehicle_types": []
      },
      {
        "name": "Morning deployment drop off caps",
        "maximum": 5,
        "rule_id": "bdc63ec7-dbf4-4c83-b45d-53fc7b33c0c6",
        "end_time": "10:00:00",
        "statuses": {
          "reserved": [],
          "available": []
        },
        "rule_type": "count",
        "start_time": "05:00:00",
        "geographies": [
          "73779ce8-e0fb-48c0-96ba-a1e7f7738279"
        ],
        "vehicle_types": []
      },
      {
        "name": "Morning deployment drop off caps",
        "maximum": 5,
        "rule_id": "8504b35d-dcdc-427a-adb1-659cdea22971",
        "end_time": "10:00:00",
        "statuses": {
          "reserved": [],
          "available": []
        },
        "rule_type": "count",
        "start_time": "05:00:00",
        "geographies": [
          "24356b34-f7b8-4f1a-9e44-c941199f3b9c"
        ],
        "vehicle_types": []
      },
      {
        "name": "Morning deployment drop off caps",
        "maximum": 5,
        "rule_id": "48c6e571-c259-470f-8622-58669a7eb11e",
        "end_time": "10:00:00",
        "statuses": {
          "reserved": [],
          "available": []
        },
        "rule_type": "count",
        "start_time": "05:00:00",
        "geographies": [
          "79d572a4-6333-441a-9289-d244b555c8bb"
        ],
        "vehicle_types": []
      },
      {
        "name": "Morning deployment drop off caps",
        "maximum": 5,
        "rule_id": "2fa9ba4b-a9e7-4f98-a73d-43a9fdc21718",
        "end_time": "10:00:00",
        "statuses": {
          "reserved": [],
          "available": []
        },
        "rule_type": "count",
        "start_time": "05:00:00",
        "geographies": [
          "f8b380ad-d112-4085-8ba8-1fbd2da2729a"
        ],
        "vehicle_types": []
      },
      {
        "name": "Morning deployment drop off caps",
        "maximum": 5,
        "rule_id": "719c0bf1-3855-4123-aa07-66301e79b4e0",
        "end_time": "10:00:00",
        "statuses": {
          "reserved": [],
          "available": []
        },
        "rule_type": "count",
        "start_time": "05:00:00",
        "geographies": [
          "8c811dcf-ccb3-4da4-b821-e9e980a696ee"
        ],
        "vehicle_types": []
      },
      {
        "name": "Morning deployment drop off caps",
        "maximum": 5,
        "rule_id": "7da6cc31-ada2-482f-8564-0af475cb6c17",
        "end_time": "10:00:00",
        "statuses": {
          "reserved": [],
          "available": []
        },
        "rule_type": "count",
        "start_time": "05:00:00",
        "geographies": [
          "24d70247-fd01-4718-a169-d91b1833472c"
        ],
        "vehicle_types": []
      },
      {
        "name": "Morning deployment drop off caps",
        "maximum": 5,
        "rule_id": "38702f7a-71b6-487d-b2aa-a9821118e779",
        "end_time": "10:00:00",
        "statuses": {
          "reserved": [],
          "available": []
        },
        "rule_type": "count",
        "start_time": "05:00:00",
        "geographies": [
          "088838d2-614e-4a03-be3f-5151eefd5350"
        ],
        "vehicle_types": []
      },
      {
        "name": "Morning deployment drop off caps",
        "maximum": 5,
        "rule_id": "dcb1ce1e-ee9e-45f0-82cf-a60344fd8859",
        "end_time": "10:00:00",
        "statuses": {
          "reserved": [],
          "available": []
        },
        "rule_type": "count",
        "start_time": "05:00:00",
        "geographies": [
          "fefa3f00-c35e-4394-a2a9-86a07c592c91"
        ],
        "vehicle_types": []
      },
      {
        "name": "Morning deployment drop off caps",
        "maximum": 5,
        "rule_id": "3b6c3b3c-b61e-459f-a5ff-860ceaa6eef1",
        "end_time": "10:00:00",
        "statuses": {
          "reserved": [],
          "available": []
        },
        "rule_type": "count",
        "start_time": "05:00:00",
        "geographies": [
          "52493dc9-ab29-4956-8371-bb358d1ab3cc"
        ],
        "vehicle_types": []
      },
      {
        "name": "Morning deployment drop off caps",
        "maximum": 5,
        "rule_id": "e143b1d3-9ef9-44d5-9b63-9ceb832f8744",
        "end_time": "10:00:00",
        "statuses": {
          "reserved": [],
          "available": []
        },
        "rule_type": "count",
        "start_time": "05:00:00",
        "geographies": [
          "14e70eed-4828-43c0-bc4d-d7399bea9c0a"
        ],
        "vehicle_types": []
      },
      {
        "name": "Morning deployment drop off caps",
        "maximum": 5,
        "rule_id": "f5a367d6-2abe-44b0-aa2f-06f3e2e11a00",
        "end_time": "10:00:00",
        "statuses": {
          "reserved": [],
          "available": []
        },
        "rule_type": "count",
        "start_time": "05:00:00",
        "geographies": [
          "2febdefd-9c2f-4307-a18e-fd0748a2b940"
        ],
        "vehicle_types": []
      },
      {
        "name": "Morning deployment drop off caps",
        "maximum": 5,
        "rule_id": "fe3aab9d-9d33-4838-9d38-125e7a13328c",
        "end_time": "10:00:00",
        "statuses": {
          "reserved": [],
          "available": []
        },
        "rule_type": "count",
        "start_time": "05:00:00",
        "geographies": [
          "e6f1c34a-2b3c-4346-89b7-dac35403f990"
        ],
        "vehicle_types": []
      },
      {
        "name": "No deployments or rebalancing outside of parking zones",
        "maximum": 0,
        "rule_id": "119b474e-e0eb-4958-8b5a-5898995b6dea",
        "statuses": {
          "available": [
            "service_start",
            "provider_drop_off"
          ]
        },
        "rule_type": "count",
        "geographies": [
          "2484bca1-965a-48b0-8279-f20a9940e786"
        ],
        "vehicle_types": []
      }
    ],
    "end_date": null,
    "policy_id": "99ec9b38-9750-4a6f-b87b-b1eaae735146",
    "start_date": 1627671600000,
    "description": "Operators are authorized to begin daily deployment only between the hours of 5:00 a.m. to 10:00 a.m., daily, AND are authorized to deploy up to a maximum of 5 vehicles per parking zone.",
    "provider_ids": [],
    "publish_date": 1627599632889,
    "prev_policies": [
      "fe75af8e-fb12-40fe-b85b-2c82487afadd"
    ]
  },
  {
    "name": "Deactivate: Venice Special Operating Zone: Operator Deploy and Rebalance in Parking Zones Only (Revised July 2021)",
    "rules": [
      {
        "name": "Deactivate",
        "minimum": 0,
        "rule_id": "f84b9dc0-3b47-4118-b4a9-67db5c647429",
        "statuses": {},
        "rule_type": "count",
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
          "73779ce8-e0fb-48c0-96ba-a1e7f7738279",
          "24356b34-f7b8-4f1a-9e44-c941199f3b9c",
          "79d572a4-6333-441a-9289-d244b555c8bb",
          "f8b380ad-d112-4085-8ba8-1fbd2da2729a",
          "8c811dcf-ccb3-4da4-b821-e9e980a696ee",
          "24d70247-fd01-4718-a169-d91b1833472c",
          "088838d2-614e-4a03-be3f-5151eefd5350",
          "fefa3f00-c35e-4394-a2a9-86a07c592c91",
          "52493dc9-ab29-4956-8371-bb358d1ab3cc",
          "14e70eed-4828-43c0-bc4d-d7399bea9c0a",
          "2febdefd-9c2f-4307-a18e-fd0748a2b940",
          "e6f1c34a-2b3c-4346-89b7-dac35403f990"
        ]
      }
    ],
    "end_date": null,
    "policy_id": "5f42d77a-fb45-4fdf-a3d0-5c8984491087",
    "start_date": 1627599782062,
    "description": "Deactivates policy 9c109e0c-b8a8-451c-bb47-df889254b319",
    "provider_ids": [],
    "publish_date": 1627599682248,
    "prev_policies": [
      "9c109e0c-b8a8-451c-bb47-df889254b319"
    ]
  },
  {
    "name": "Deactivate: Venice Special Operating Zone Fleet Cap",
    "rules": [
      {
        "name": "Deactivate",
        "minimum": 0,
        "rule_id": "45703dfa-f22f-43ad-940d-34082e34dde5",
        "statuses": {},
        "rule_type": "count",
        "geographies": [
          "e0e4a085-7a50-43e0-afa4-6792ca897c5a"
        ]
      }
    ],
    "end_date": null,
    "policy_id": "7f67025b-ff5b-4853-b5d2-e43c4b7b36d9",
    "start_date": 1627600163187,
    "description": "Deactivates policy ed3d5e2f-c036-4083-9ecc-9a277f64a743",
    "provider_ids": [],
    "publish_date": 1627600063561,
    "prev_policies": [
      "ed3d5e2f-c036-4083-9ecc-9a277f64a743"
    ]
  },
  {
    "name": "TEsting",
    "rules": [
      {
        "name": "Fleet cap in downtown",
        "maximum": 1000,
        "rule_id": "f5abf2a4-2141-4ceb-868c-08f588b2ce15",
        "statuses": {
          "reserved": [],
          "available": [
            "trip_end"
          ]
        },
        "rule_type": "count",
        "geographies": [
          "2ace74a5-2233-48b2-a194-0b52f9283336",
          "33cb3bf8-92ab-4a2f-978f-89f21fd770dc",
          "dbceb236-36c0-469d-a6eb-c27d878e5453",
          "aad206a0-f32e-4442-a459-6b73f5cd94bb",
          "2484bca1-965a-48b0-8279-f20a9940e786"
        ],
        "vehicle_types": [
          "scooter",
          "bicycle"
        ]
      }
    ],
    "end_date": null,
    "policy_id": "74688464-37f8-4e97-a624-1e8473f4a843",
    "start_date": 1627974000000,
    "description": "Testing Policey creation in test",
    "provider_ids": [
      "c20e08cf-8488-46a6-a66c-5d8fb827f7e0",
      "63f13c48-34ff-49d2-aca7-cf6a5b6171c3",
      "e714f168-ce56-4b41-81b7-0b6a4bd26128",
      "b79f8687-526d-4ae6-80bf-89b4c44dc071"
    ],
    "publish_date": 1627949244547,
    "prev_policies": null
  },
  {
    "name": "Tim P1",
    "rules": [
      {
        "name": "rule 1",
        "minimum": 0,
        "rule_id": "eaf66c54-de02-40de-ac60-908bd9fdacc2",
        "statuses": {},
        "rule_type": "count",
        "geographies": [
          "ca1b0365-a18b-4f3b-895e-c7e1308b4373"
        ],
        "vehicle_types": []
      }
    ],
    "end_date": null,
    "policy_id": "a69ab621-d360-4ea5-98c9-268937a002ab",
    "start_date": 1571468400000,
    "description": "asdf",
    "provider_ids": [],
    "publish_date": 1571425728620,
    "prev_policies": null
  },
  {
    "name": "test publishing",
    "rules": [
      {
        "name": "test publishing",
        "minimum": 0,
        "rule_id": "0d5a4d22-3ef1-4d69-b079-a770d00180c8",
        "statuses": {},
        "rule_type": "count",
        "geographies": [
          "0e93f5ef-805e-4270-aab8-5a8acaf626e0"
        ],
        "vehicle_types": []
      }
    ],
    "end_date": null,
    "policy_id": "79ab0b6d-9810-410f-802e-b9acdb081939",
    "start_date": 1573804800000,
    "description": "test publishing of geography",
    "provider_ids": [],
    "publish_date": 1573759424838,
    "prev_policies": null
  },
  {
    "name": "Deactivate: Vehicle cap count for City of Miami",
    "rules": [
      {
        "name": "Deactivate",
        "minimum": 0,
        "rule_id": "d4273135-c914-438f-b0a3-4b5589334ad5",
        "statuses": {},
        "rule_type": "count",
        "geographies": [
          "2ace74a5-2233-48b2-a194-0b52f9283336"
        ]
      }
    ],
    "end_date": null,
    "policy_id": "f2794ed2-bdd9-407d-8554-e09f75f03350",
    "start_date": 1588375407004,
    "description": "Deactivates policy fa7565a3-7c86-4bce-b8b5-dcba64115d32",
    "provider_ids": [],
    "publish_date": 1588375407113,
    "prev_policies": [
      "fa7565a3-7c86-4bce-b8b5-dcba64115d32"
    ]
  },
  {
    "name": "Deactivate: prohibited parking henry",
    "rules": [
      {
        "name": "Deactivate",
        "minimum": 0,
        "rule_id": "694cfab4-9e1f-46b1-ba74-f44eb54c97d0",
        "statuses": {},
        "rule_type": "count",
        "geographies": [
          "fa5ebc7a-b7fc-473b-bc5a-2aad642e2e64"
        ]
      }
    ],
    "end_date": null,
    "policy_id": "b5107da3-ca9d-4fac-af76-a301635bced0",
    "start_date": 1588377671729,
    "description": "Deactivates policy 1f7e9f15-0a42-45bb-9cd1-9b1656452324",
    "provider_ids": [
      "2411d395-04f2-47c9-ab66-d09e9e3c3251",
      "35d898bd-f2cd-4664-a2dc-d522ec1d1aa4",
      "63f13c48-34ff-49d2-aca7-cf6a5b6171c3",
      "74ec91e0-ba2a-4505-bbb6-f9c048cd5998",
      "d73fcf80-22b1-450f-b535-042b4e30aac7",
      "e714f168-ce56-4b41-81b7-0b6a4bd26128",
      "fcc794ca-d79e-4b2b-b92d-3169688731d0"
    ],
    "publish_date": 1588377671844,
    "prev_policies": [
      "1f7e9f15-0a42-45bb-9cd1-9b1656452324"
    ]
  },
  {
    "name": "Deactivate: fghgfh",
    "rules": [
      {
        "name": "Deactivate",
        "minimum": 0,
        "rule_id": "db7cd357-fd48-4338-aef5-6ead59047c9c",
        "statuses": {},
        "rule_type": "count",
        "geographies": [
          "bfa3395a-0197-4867-b4c1-e03f6cf064df"
        ]
      }
    ],
    "end_date": null,
    "policy_id": "aabbbb73-a09d-4ee9-a279-8e4ca9c263a8",
    "start_date": 1588377666432,
    "description": "Deactivates policy 82c5e445-1297-48e6-809f-f7dc5bdac006",
    "provider_ids": [
      "2411d395-04f2-47c9-ab66-d09e9e3c3251",
      "35d898bd-f2cd-4664-a2dc-d522ec1d1aa4",
      "63f13c48-34ff-49d2-aca7-cf6a5b6171c3",
      "74ec91e0-ba2a-4505-bbb6-f9c048cd5998",
      "d73fcf80-22b1-450f-b535-042b4e30aac7",
      "e714f168-ce56-4b41-81b7-0b6a4bd26128",
      "fcc794ca-d79e-4b2b-b92d-3169688731d0"
    ],
    "publish_date": 1588377666750,
    "prev_policies": [
      "82c5e445-1297-48e6-809f-f7dc5bdac006"
    ]
  },
  {
    "name": "Deactivate: fleet size henry",
    "rules": [
      {
        "name": "Deactivate",
        "minimum": 0,
        "rule_id": "22374f0d-9671-4793-a267-4de38ed1a196",
        "statuses": {},
        "rule_type": "count",
        "geographies": [
          "a56c29b1-7b32-478e-ac23-08cfe68db338"
        ]
      }
    ],
    "end_date": null,
    "policy_id": "3cb68566-7d28-422e-a8f2-8e38fff28eed",
    "start_date": 1588377676545,
    "description": "Deactivates policy e12883f6-1870-4c0b-9def-bc7dd8e99241",
    "provider_ids": [
      "2411d395-04f2-47c9-ab66-d09e9e3c3251",
      "35d898bd-f2cd-4664-a2dc-d522ec1d1aa4",
      "63f13c48-34ff-49d2-aca7-cf6a5b6171c3",
      "74ec91e0-ba2a-4505-bbb6-f9c048cd5998",
      "d73fcf80-22b1-450f-b535-042b4e30aac7",
      "e714f168-ce56-4b41-81b7-0b6a4bd26128",
      "fcc794ca-d79e-4b2b-b92d-3169688731d0"
    ],
    "publish_date": 1588377676654,
    "prev_policies": [
      "e12883f6-1870-4c0b-9def-bc7dd8e99241"
    ]
  },
  {
    "name": "Deactivate: tim - publish test 1",
    "rules": [
      {
        "name": "Deactivate",
        "minimum": 0,
        "rule_id": "73a4b0b2-437b-44b7-9156-59fb4c0f02e5",
        "statuses": {},
        "rule_type": "count",
        "geographies": [
          "88476666-2c50-4ff4-9530-1758befa9319"
        ]
      }
    ],
    "end_date": null,
    "policy_id": "b33fec94-814d-4411-9802-a51567614d37",
    "start_date": 1588377954447,
    "description": "Deactivates policy 256c4b13-12b7-4afd-b6ac-617568cc00c4",
    "provider_ids": [],
    "publish_date": 1588377954711,
    "prev_policies": [
      "256c4b13-12b7-4afd-b6ac-617568cc00c4"
    ]
  },
  {
    "name": "Deactivate: Hollywood Boulevard SOZ (draft 1)",
    "rules": [
      {
        "name": "Deactivate",
        "minimum": 0,
        "rule_id": "79276158-a196-48d6-8b79-5ec2f76bb5da",
        "statuses": {},
        "rule_type": "count",
        "geographies": [
          "15d18aea-bfd8-4fad-845e-1c2d41436c61"
        ]
      }
    ],
    "end_date": null,
    "policy_id": "28202140-cebd-4865-ab85-05b9c5358245",
    "start_date": 1588378227477,
    "description": "Deactivates policy 217e57c9-e78e-43d4-9bec-b7613fa2fe7a",
    "provider_ids": [],
    "publish_date": 1588378227729,
    "prev_policies": [
      "217e57c9-e78e-43d4-9bec-b7613fa2fe7a"
    ]
  },
  {
    "name": "Deactivate: Hollywood Boulevard SOZ (draft)",
    "rules": [
      {
        "name": "Deactivate",
        "minimum": 0,
        "rule_id": "d45d979b-7db1-4016-a355-839a57d8ddc1",
        "statuses": {},
        "rule_type": "count",
        "geographies": [
          "15d18aea-bfd8-4fad-845e-1c2d41436c61"
        ]
      }
    ],
    "end_date": null,
    "policy_id": "12738ec7-3092-49ab-a486-b1633f37250b",
    "start_date": 1588621162155,
    "description": "Deactivates policy d15eb598-d328-457b-b939-fe8d8bc14296",
    "provider_ids": [],
    "publish_date": 1588621162278,
    "prev_policies": [
      "d15eb598-d328-457b-b939-fe8d8bc14296"
    ]
  },
  {
    "name": "Hollywood Boulevard SOZ (draft)",
    "rules": [
      {
        "name": "Hollywould Boulevard SOZ",
        "minimum": 0,
        "rule_id": "143ce880-81ed-46ff-8498-a4e73aacefef",
        "statuses": {
          "trip": [],
          "removed": [],
          "inactive": [],
          "reserved": [],
          "available": [],
          "unavailable": []
        },
        "rule_type": "count",
        "geographies": [
          "15d18aea-bfd8-4fad-845e-1c2d41436c61"
        ],
        "vehicle_types": []
      }
    ],
    "end_date": null,
    "policy_id": "d0c35903-5d00-4404-90af-a5df4b15650e",
    "start_date": 1588575600000,
    "description": "Hollywood Boulevard SOZ (draft)",
    "provider_ids": [
      "2411d395-04f2-47c9-ab66-d09e9e3c3251",
      "3291c288-c9c8-42f1-bc3e-8502b077cd7f",
      "c20e08cf-8488-46a6-a66c-5d8fb827f7e0",
      "63f13c48-34ff-49d2-aca7-cf6a5b6171c3",
      "e714f168-ce56-4b41-81b7-0b6a4bd26128",
      "3c95765d-4da6-41c6-b61e-1954472ec6c9",
      "70aa475d-1fcd-4504-b69c-2eeb2107f7be",
      "b79f8687-526d-4ae6-80bf-89b4c44dc071"
    ],
    "publish_date": 1588632345033,
    "prev_policies": [
      "6624448b-3a83-430e-844f-ad530d276b54"
    ]
  },
  {
    "name": "Deactivate: Test 11",
    "rules": [
      {
        "name": "Deactivate",
        "minimum": 0,
        "rule_id": "c2bd9cd6-fe35-4b15-950d-fa96ff485160",
        "statuses": {},
        "rule_type": "count",
        "geographies": [
          "15d18aea-bfd8-4fad-845e-1c2d41436c61"
        ]
      }
    ],
    "end_date": null,
    "policy_id": "10f84d1c-8073-419b-a05a-4e53194ca870",
    "start_date": 1588876820035,
    "description": "Deactivates policy 568f4aeb-b9cb-4868-ace7-dffce783865d",
    "provider_ids": [
      "2411d395-04f2-47c9-ab66-d09e9e3c3251",
      "3291c288-c9c8-42f1-bc3e-8502b077cd7f",
      "c20e08cf-8488-46a6-a66c-5d8fb827f7e0",
      "63f13c48-34ff-49d2-aca7-cf6a5b6171c3",
      "e714f168-ce56-4b41-81b7-0b6a4bd26128",
      "3c95765d-4da6-41c6-b61e-1954472ec6c9",
      "70aa475d-1fcd-4504-b69c-2eeb2107f7be",
      "b79f8687-526d-4ae6-80bf-89b4c44dc071"
    ],
    "publish_date": 1588876820362,
    "prev_policies": [
      "568f4aeb-b9cb-4868-ace7-dffce783865d"
    ]
  },
  {
    "name": "Venice Beach Walk Streets: Ride-through only",
    "rules": [
      {
        "name": "Venice Beach Walk Streets: No trip starts, ends",
        "maximum": 0,
        "rule_id": "054c2dd9-f883-49fc-8112-e3d6566b4bc9",
        "statuses": {
          "trip": [],
          "reserved": [],
          "available": [],
          "unavailable": []
        },
        "rule_type": "count",
        "start_time": "12:00:00",
        "geographies": [
          "713ce7fa-38b9-4e4d-81d8-519e2d6cf350"
        ],
        "vehicle_types": []
      }
    ],
    "end_date": null,
    "policy_id": "65b63667-b43e-4c0e-b24f-56b8096c0946",
    "start_date": 1599699600000,
    "description": "Venice Beach Walk Streets: Ride-through only,  No start/end trips, no fleet deployments",
    "provider_ids": [],
    "publish_date": 1599687656763,
    "prev_policies": null
  },
  {
    "name": "Venice Beach Walk Streets: 5 mph speed limit",
    "rules": [
      {
        "name": "Venice Beach Walk Streets: 5 mph speed limit",
        "maximum": 5,
        "rule_id": "6e1e6e88-d2ae-4216-a9f1-85f2fb1ec0db",
        "statuses": {},
        "rule_type": "speed",
        "rule_units": "mph",
        "geographies": [
          "9a3bb779-cd3f-43ed-bc87-2c12235040f0"
        ],
        "vehicle_types": []
      }
    ],
    "end_date": null,
    "policy_id": "5b9bd34f-18c3-48b3-942f-97473f0bfdd5",
    "start_date": 1599699600000,
    "description": "Venice Beach Walk Streets: 5 mph speed limit on certain locations",
    "provider_ids": [],
    "publish_date": 1599687661919,
    "prev_policies": null
  },
  {
    "name": "Venice Special Operating Zone Fleet Cap (Revised July 2021)",
    "rules": [
      {
        "name": "Venice Beach SOZ: Operator Fleet Cap",
        "maximum": 150,
        "rule_id": "b5609821-9c32-4973-bc85-f82fafd9a114",
        "statuses": {
          "reserved": [],
          "available": []
        },
        "rule_type": "count",
        "geographies": [
          "2484bca1-965a-48b0-8279-f20a9940e786"
        ],
        "vehicle_types": [
          "bicycle",
          "scooter"
        ]
      }
    ],
    "end_date": null,
    "policy_id": "ada5f57e-6e7c-4935-b42e-632d698510c7",
    "start_date": 1627671600000,
    "description": "Fleet caps for all providers in the Venice Special Operating Zone",
    "provider_ids": [],
    "publish_date": 1627595112393
  },
  {
    "name": "Deactivate: azeaze",
    "rules": [
      {
        "name": "Deactivate",
        "minimum": 0,
        "rule_id": "c597ac28-7742-4a95-8f8d-cfa22200d8ef",
        "statuses": {},
        "rule_type": "count",
        "geographies": [
          "e025fee3-7056-4637-a65c-81291b51fa7b"
        ]
      }
    ],
    "end_date": null,
    "policy_id": "e3b439d2-8827-417b-8d9e-877678becae9",
    "start_date": 1629312510204,
    "description": "Deactivates policy 20d06024-555d-4660-b577-9db72f802d30",
    "provider_ids": [
      "43f31426-8a9f-4ac6-8058-80fb15b8598e",
      "63c1d0b5-5253-4495-a3c4-c4bf805e98ec",
      "7a853ab8-340f-4751-9ff7-5845866d4699",
      "a2bd08b8-1f84-4aa2-b34b-ad27c0f1fe02"
    ],
    "publish_date": 1629312410521,
    "prev_policies": [
      "20d06024-555d-4660-b577-9db72f802d30"
    ]
  },
  {
    "name": "Deactivate: AAA test",
    "rules": [
      {
        "name": "Deactivate",
        "minimum": 0,
        "rule_id": "66c3e0b2-681c-41e9-99ea-8b9b4908d322",
        "statuses": {},
        "rule_type": "count",
        "geographies": [
          "9cb84b36-ce91-4228-b4bd-df7dbf8c672e"
        ]
      }
    ],
    "end_date": null,
    "policy_id": "e92ea32b-3f4f-4e40-8ac3-f2d6c89801bd",
    "start_date": 1600387470577,
    "description": "Deactivates policy fb000a4f-1a9f-4515-98d3-823ec8591697",
    "provider_ids": [],
    "publish_date": 1600387370631,
    "prev_policies": [
      "fb000a4f-1a9f-4515-98d3-823ec8591697"
    ]
  },
  {
    "name": "Deactivate: Group demo",
    "rules": [
      {
        "name": "Deactivate",
        "minimum": 0,
        "rule_id": "14113c88-b5a8-43ea-af27-3a151ee0c644",
        "statuses": {},
        "rule_type": "count",
        "geographies": [
          "9a793ce0-186f-4c1d-8c87-7586c88c471c"
        ]
      }
    ],
    "end_date": null,
    "policy_id": "f3fc2246-fc0f-472a-8845-591941c94337",
    "start_date": 1600387861616,
    "description": "Deactivates policy d3216ab9-f3e5-4acc-8dfe-b68e6686b06e",
    "provider_ids": [],
    "publish_date": 1600387761754,
    "prev_policies": [
      "d3216ab9-f3e5-4acc-8dfe-b68e6686b06e"
    ]
  },
  {
    "name": "Deactivate: MICHAEL Test Policy",
    "rules": [
      {
        "name": "Deactivate",
        "minimum": 0,
        "rule_id": "02294ec1-93a9-4dee-9067-46d1417bb126",
        "statuses": {},
        "rule_type": "count",
        "geographies": [
          "a9b00de9-e325-40d9-b34d-3a37c1bd54d7"
        ]
      }
    ],
    "end_date": null,
    "policy_id": "faf0d0b2-4645-4f06-a28e-1b0564e73634",
    "start_date": 1600387875184,
    "description": "Deactivates policy 4110267a-fc2f-44fe-aca1-d55b23a7f486",
    "provider_ids": [],
    "publish_date": 1600387775323,
    "prev_policies": [
      "4110267a-fc2f-44fe-aca1-d55b23a7f486"
    ]
  },
  {
    "name": "Deactivate: azeaze",
    "rules": [
      {
        "name": "Deactivate",
        "minimum": 0,
        "rule_id": "732facde-7f7d-4abb-be63-9f2b75f8a4ce",
        "statuses": {},
        "rule_type": "count",
        "geographies": [
          "6dc1bfc9-0226-45e9-ab03-935cd7eac360"
        ]
      }
    ],
    "end_date": null,
    "policy_id": "42eaac2f-6de6-4f09-a9aa-719c32d13529",
    "start_date": 1629312517650,
    "description": "Deactivates policy 9cde69b7-ef46-4b13-856b-c91c8213afbe",
    "provider_ids": [
      "79b5f1e1-d415-411f-882f-0291e2bf914b",
      "8fbf7ac6-39b2-4e80-b049-d9e0463cab41",
      "b50a850f-eb82-4275-b72a-bb632ff302c6",
      "e1656ef5-2ca4-485c-b4f1-7f4371b3b125"
    ],
    "publish_date": 1629312417801,
    "prev_policies": [
      "9cde69b7-ef46-4b13-856b-c91c8213afbe"
    ]
  },
  {
    "name": "Deactivate: Manual permit test",
    "rules": [
      {
        "name": "Deactivate",
        "minimum": 0,
        "rule_id": "416d6481-e97d-4713-bad3-c6d8360620ea",
        "statuses": {},
        "rule_type": "count",
        "geographies": [
          "71bfbd15-fc23-47fa-9ff5-6d6f7747336a"
        ]
      }
    ],
    "end_date": null,
    "policy_id": "b766f643-dc1d-4328-8440-82d25a7226d5",
    "start_date": 1600387900868,
    "description": "Deactivates policy 431623d3-1f41-4f18-b564-855827c57cb7",
    "provider_ids": [
      "22f9e0ff-93b0-435b-b2ed-79e60d079838"
    ],
    "publish_date": 1600387801012,
    "prev_policies": [
      "431623d3-1f41-4f18-b564-855827c57cb7"
    ]
  },
  {
    "name": "Deactivate: aezaze",
    "rules": [
      {
        "name": "Deactivate",
        "minimum": 0,
        "rule_id": "d75867a2-fc09-4e72-bb62-74c93356cae3",
        "statuses": {},
        "rule_type": "count",
        "geographies": [
          "109df213-aff6-4eb8-b9e6-8a3ffc6d55fa"
        ]
      }
    ],
    "end_date": null,
    "policy_id": "c34e5d07-8d6b-4f7f-b4fb-528bb63c062a",
    "start_date": 1600387975422,
    "description": "Deactivates policy 8e0244c0-2608-48c3-87ba-1e4968ca4f97",
    "provider_ids": [
      "07975cc8-c8c4-4544-9090-082e03477633",
      "1239e0ad-c115-44cd-9ee3-e03ac4faa79a",
      "7514fb21-ff10-478e-9183-6a6bfb38f9ac",
      "9bf0b395-012a-4566-ab15-a475e35d0af2"
    ],
    "publish_date": 1600387875562,
    "prev_policies": [
      "8e0244c0-2608-48c3-87ba-1e4968ca4f97"
    ]
  },
  {
    "name": "Deactivate: azeae",
    "rules": [
      {
        "name": "Deactivate",
        "minimum": 0,
        "rule_id": "2a2f5682-8fab-4ade-9871-f9aa7be46ea7",
        "statuses": {},
        "rule_type": "count",
        "geographies": [
          "07fafddf-05ae-4b19-92cf-e5409e1ec222"
        ]
      }
    ],
    "end_date": null,
    "policy_id": "71f62118-e8d7-4920-856f-ea58d1096521",
    "start_date": 1600388003558,
    "description": "Deactivates policy 0293d588-4c0a-4d77-bc71-3f08536532df",
    "provider_ids": [
      "43f31426-8a9f-4ac6-8058-80fb15b8598e",
      "63c1d0b5-5253-4495-a3c4-c4bf805e98ec",
      "7a853ab8-340f-4751-9ff7-5845866d4699",
      "a2bd08b8-1f84-4aa2-b34b-ad27c0f1fe02"
    ],
    "publish_date": 1600387903689,
    "prev_policies": [
      "0293d588-4c0a-4d77-bc71-3f08536532df"
    ]
  },
  {
    "name": "Deactivate: azeaze",
    "rules": [
      {
        "name": "Deactivate",
        "minimum": 0,
        "rule_id": "698b7010-4624-4542-bc7f-e3af50cee1ac",
        "statuses": {},
        "rule_type": "count",
        "geographies": [
          "1f943d59-ccc9-4d91-b6e2-0c5e771cbc49"
        ]
      }
    ],
    "end_date": null,
    "policy_id": "b658a354-0cbe-49c0-bf3d-68623bb1bd8b",
    "start_date": 1600388012491,
    "description": "Deactivates policy 01b1689c-ec6a-4ec9-9bc9-e368b9c42374",
    "provider_ids": [
      "9d6d229a-8378-44ca-b51b-f53fe239f388"
    ],
    "publish_date": 1600387912629,
    "prev_policies": [
      "01b1689c-ec6a-4ec9-9bc9-e368b9c42374"
    ]
  },
  {
    "name": "Deactivate: aaaaa",
    "rules": [
      {
        "name": "Deactivate",
        "minimum": 0,
        "rule_id": "eb07645f-9062-4bee-b7c4-f647bbd39bb9",
        "statuses": {},
        "rule_type": "count",
        "geographies": [
          "f6377553-de9b-4280-bcc9-81443f5f9e6e"
        ]
      }
    ],
    "end_date": null,
    "policy_id": "faabf1e0-c0f2-429c-8664-2605ff39de29",
    "start_date": 1600388040931,
    "description": "Deactivates policy 646ca071-c44d-43e3-bd0a-f4aa9374f2c5",
    "provider_ids": [
      "43f31426-8a9f-4ac6-8058-80fb15b8598e",
      "63c1d0b5-5253-4495-a3c4-c4bf805e98ec",
      "7a853ab8-340f-4751-9ff7-5845866d4699",
      "a2bd08b8-1f84-4aa2-b34b-ad27c0f1fe02"
    ],
    "publish_date": 1600387941069,
    "prev_policies": [
      "646ca071-c44d-43e3-bd0a-f4aa9374f2c5"
    ]
  },
  {
    "name": "Deactivate: aaaaaaa",
    "rules": [
      {
        "name": "Deactivate",
        "minimum": 0,
        "rule_id": "80975ee9-402d-4583-a3f1-8afdbfdb52a7",
        "statuses": {},
        "rule_type": "count",
        "geographies": [
          "bcb91b72-82d1-49df-9b44-23c313e4f376"
        ]
      }
    ],
    "end_date": null,
    "policy_id": "7215f508-75c1-481f-9d36-ed4bfe459073",
    "start_date": 1600388049683,
    "description": "Deactivates policy e84747e6-e456-4560-a7b9-ebe8505c92cb",
    "provider_ids": [
      "16936b4d-223c-4336-9265-f8ecc6deaf1a",
      "332767df-d71e-4211-bc60-59197afa36bc",
      "66618e4c-4946-4877-b8d9-6245650b8f74",
      "73a28370-559d-45ea-acf6-8d30a37c1dbe"
    ],
    "publish_date": 1600387949820,
    "prev_policies": [
      "e84747e6-e456-4560-a7b9-ebe8505c92cb"
    ]
  },
  {
    "name": "Deactivate: aaaaa",
    "rules": [
      {
        "name": "Deactivate",
        "minimum": 0,
        "rule_id": "a5baf75f-b06f-49dd-a2aa-5e04027aee30",
        "statuses": {},
        "rule_type": "count",
        "geographies": [
          "604f087b-4c76-4868-8a48-df48dee405bd"
        ]
      }
    ],
    "end_date": null,
    "policy_id": "95c92c58-831e-4005-94c9-b862f86d7253",
    "start_date": 1600388067459,
    "description": "Deactivates policy a6c46e7d-7a10-48f8-a003-eeaf00dbad10",
    "provider_ids": [
      "43f31426-8a9f-4ac6-8058-80fb15b8598e",
      "63c1d0b5-5253-4495-a3c4-c4bf805e98ec",
      "7a853ab8-340f-4751-9ff7-5845866d4699",
      "a2bd08b8-1f84-4aa2-b34b-ad27c0f1fe02"
    ],
    "publish_date": 1600387967597,
    "prev_policies": [
      "a6c46e7d-7a10-48f8-a003-eeaf00dbad10"
    ]
  },
  {
    "name": "Deactivate: azeaze",
    "rules": [
      {
        "name": "Deactivate",
        "minimum": 0,
        "rule_id": "d20c80d3-9ab6-4939-9a0f-db1d1d7ba925",
        "statuses": {},
        "rule_type": "count",
        "geographies": [
          "681040cb-50f7-4106-a95e-28ae049b69d0"
        ]
      }
    ],
    "end_date": null,
    "policy_id": "c288b838-a094-48fd-a892-007a88661623",
    "start_date": 1600388098959,
    "description": "Deactivates policy 7fc47736-901c-4502-a8c9-126841e95b4a",
    "provider_ids": [
      "43f31426-8a9f-4ac6-8058-80fb15b8598e",
      "63c1d0b5-5253-4495-a3c4-c4bf805e98ec",
      "7a853ab8-340f-4751-9ff7-5845866d4699",
      "a2bd08b8-1f84-4aa2-b34b-ad27c0f1fe02"
    ],
    "publish_date": 1600387999086,
    "prev_policies": [
      "7fc47736-901c-4502-a8c9-126841e95b4a"
    ]
  },
  {
    "name": "Deactivate: Venice Special Operating Zone Fleet Cap",
    "rules": [
      {
        "name": "Deactivate",
        "minimum": 0,
        "rule_id": "8d228417-8669-488c-b2b6-579fd6bfa473",
        "statuses": {},
        "rule_type": "count",
        "geographies": [
          "e0e4a085-7a50-43e0-afa4-6792ca897c5a"
        ]
      }
    ],
    "end_date": null,
    "policy_id": "dd1f6b41-8544-4309-af96-f9e888f43560",
    "start_date": 1600471697316,
    "description": "Deactivates policy b3da82de-8126-494e-8e93-4518c6f7d91e",
    "provider_ids": [],
    "publish_date": 1600471597779,
    "prev_policies": [
      "b3da82de-8126-494e-8e93-4518c6f7d91e"
    ]
  },
  {
    "name": "Deactivate: Permit test 25/10",
    "rules": [
      {
        "name": "Deactivate",
        "minimum": 0,
        "rule_id": "1916656c-1904-4ca7-a2b4-8a7aedf005a8",
        "statuses": {},
        "rule_type": "count",
        "geographies": [
          "a9b00de9-e325-40d9-b34d-3a37c1bd54d7"
        ]
      }
    ],
    "end_date": null,
    "policy_id": "055cabe0-c95f-4d6c-8d4a-a42b00560fcf",
    "start_date": 1600736904863,
    "description": "Deactivates policy e5ff3a1f-f46c-4961-a286-863901eb5e03",
    "provider_ids": [
      "2411d395-04f2-47c9-ab66-d09e9e3c3251",
      "3291c288-c9c8-42f1-bc3e-8502b077cd7f",
      "63f13c48-34ff-49d2-aca7-cf6a5b6171c3"
    ],
    "publish_date": 1600736805054,
    "prev_policies": [
      "e5ff3a1f-f46c-4961-a286-863901eb5e03"
    ]
  }
]

 import { FULL_STATE_MAPPING_v0_4_1_to_v1_0_0 } from './packages/mds-types/transformers/0_4_1_to_1_0_0'
import { VEHICLE_EVENT_v0_4_1 } from './packages/mds-types/transformers/@types'
type INGESTABLE_VEHICLE_EVENT = Exclude<VEHICLE_EVENT_v0_4_1, 'register'>
import { VehicleEvent_v1_0_0, VEHICLE_EVENT_v1_0_0, VEHICLE_STATE_v1_0_0 } from './packages/mds-types/transformers/@types/1_0_0'
import { uuid } from '@mds-core/mds-utils'

// const active_policies = policies.filter(p => ids.includes(p.policy_id))


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

      // new uuids for everything!
        const states = transform_rule_statuses(rule)
        delete rule.statuses
        rule.states = states
             })

    return policy
 }

function process(policies: any) {
  return policies.map((p: any) => {
    //    console.dir(p, { depth:  null })
        const policy = transform(p)
        console.dir(policy, { depth: null })
        console.log(',')
        return [p, policy]
            })
}




///*
const fs = require('fs')
console.log('logging')
fs.writeFileSync('/Users/jane/work/mds-core/all-policies-sandbox', JSON.stringify(process(policies_sandbox)), (err: any) => {
    console.log(err)
        })
//*/
