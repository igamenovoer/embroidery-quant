import { ChangeDetectionStrategy, Component, computed, output, signal } from '@angular/core';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ProcessingParameters, DitheringType, DEFAULT_PROCESSING_PARAMETERS } from '../../models/image-processing.models';

@Component({
  selector: 'app-parameter-control',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatSliderModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  templateUrl: './parameter-control.html',
  styleUrl: './parameter-control.scss'
})
export class ParameterControlComponent {
  // Reactive parameters using signals
  protected readonly colorCount = signal<number>(DEFAULT_PROCESSING_PARAMETERS.colorCount);
  protected readonly sigmaSpace = signal<number>(DEFAULT_PROCESSING_PARAMETERS.sigmaSpace);
  protected readonly sigmaColor = signal<number>(DEFAULT_PROCESSING_PARAMETERS.sigmaColor);
  protected readonly ditheringAlgorithm = signal<DitheringType>(DEFAULT_PROCESSING_PARAMETERS.ditheringAlgorithm);
  protected readonly ditheringStrength = signal<number>(DEFAULT_PROCESSING_PARAMETERS.ditheringStrength);
  
  // Computed parameters object
  protected readonly parameters = computed<ProcessingParameters>(() => ({
    colorCount: this.colorCount(),
    sigmaSpace: this.sigmaSpace(),
    sigmaColor: this.sigmaColor(),
    ditheringAlgorithm: this.ditheringAlgorithm(),
    ditheringStrength: this.ditheringStrength(),
    method: 2 // Default method
  }));
  
  // Available dithering options
  protected readonly ditheringOptions = Object.values(DitheringType);
  
  // Output events
  readonly parametersChanged = output<ProcessingParameters>();
  readonly processRequested = output<void>();
  
  protected onColorCountChange(value: number): void {
    this.colorCount.set(value);
    this.emitParametersChange();
  }
  
  protected onSigmaSpaceChange(value: number): void {
    this.sigmaSpace.set(value);
    this.emitParametersChange();
  }
  
  protected onSigmaColorChange(value: number): void {
    this.sigmaColor.set(value);
    this.emitParametersChange();
  }
  
  protected onDitheringAlgorithmChange(value: DitheringType): void {
    this.ditheringAlgorithm.set(value);
    this.emitParametersChange();
  }
  
  protected onProcessClick(): void {
    this.processRequested.emit();
  }
  
  protected resetToDefaults(): void {
    this.colorCount.set(DEFAULT_PROCESSING_PARAMETERS.colorCount);
    this.sigmaSpace.set(DEFAULT_PROCESSING_PARAMETERS.sigmaSpace);
    this.sigmaColor.set(DEFAULT_PROCESSING_PARAMETERS.sigmaColor);
    this.ditheringAlgorithm.set(DEFAULT_PROCESSING_PARAMETERS.ditheringAlgorithm);
    this.ditheringStrength.set(DEFAULT_PROCESSING_PARAMETERS.ditheringStrength);
    this.emitParametersChange();
  }
  
  private emitParametersChange(): void {
    this.parametersChanged.emit(this.parameters());
  }
}
