import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { ImageUpload } from './components/image-upload/image-upload';
import { ParameterControl } from './components/parameter-control/parameter-control';
import { ImageResults } from './components/image-results/image-results';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    MatToolbarModule,
    MatCardModule,
    ImageUpload,
    ParameterControl,
    ImageResults
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'Embroidery Oriented Image Quantization';
}
