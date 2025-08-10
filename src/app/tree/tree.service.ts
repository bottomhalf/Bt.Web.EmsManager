import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TreeService {
  public fetchNodes(): any {
    return [
      {
        "name": "Crop commodities",
        "children": [
          {
            "name": "BT",
            "children": []
          },
          {
            "name": "NT",
            "children": [
              {
                "name": "Vegetbles",
                "children": [
                  {
                    "name": "BT",
                    "children": []
                  },
                  {
                    "name": "NT",
                    "children": [
                      {
                        "name": "Seeweed",
                        "children": []
                      },
                      {
                        "name": "Lettuce and sprouts",
                        "children": []
                      },
                      {
                        "name": "Vegetable juice and drink",
                        "children": []
                      }
                    ]
                  },
                  {
                    "name": "RT",
                    "children": []
                  },
                  {
                    "name": "UF",
                    "children": []
                  }
                ]
              },
              {
                "name": "Herbs and spices",
                "children": []
              },
              {
                "name": "Nuts and seeds",
                "children": []
              },
              {
                "name": "Fruit",
                "children": []
              },
              {
                "name": "Processing crop",
                "children": []
              },
              {
                "name": "Food crop",
                "children": []
              },
              {
                "name": "Stalk and stem crop",
                "children": []
              }
            ]
          },
          {
            "name": "UF",
            "children": []
          },
          {
            "name": "USE",
            "children": []
          }
        ]
      },
      {
        "name": "A file"
      }
    ];
  }

  public processNodes(nodes: Array<any>): Array<any> {
    nodes.map(node => {
      if (node.child) {
        node['expand'] = false;
      }
    });
    return nodes;
  }
}
