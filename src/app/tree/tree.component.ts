import { Component, Input, OnInit } from '@angular/core';
import { TreeService } from './tree.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tree',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tree.component.html',
  styleUrl: './tree.component.scss'
})
export class TreeComponent implements OnInit  {
  
  constructor (private treeService: TreeService) {}
  
  @Input() nodes;

  ngOnInit() {
    this.nodes = this.treeService.processNodes(this.nodes);
  }

  public onFolderButtonClick(folder) {
    folder['expand'] = !folder['expand'];
  }

  public trackNode(index, folder) {
    return folder.name;
  }
}
