import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { ImageUploadComponent } from './components/image-upload/image-upload.component';
import { ParameterControlComponent } from './components/parameter-control/parameter-control.component';
import { ImageResultsComponent } from './components/image-results/image-results.component';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    MatToolbarModule,
    MatCardModule,
    ImageUploadComponent,
    ParameterControlComponent,
    ImageResultsComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent {
  protected readonly title = 'Embroidery Oriented Image Quantization';
}
