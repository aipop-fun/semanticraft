import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SemanticraftComponent } from './semanticraft.component';
import { SemanticraftDirective } from './semanticraft.directive';
import { SemanticraftService } from './semanticraft.service';

export interface SemanticraftConfig {
  apiUrl?: string;
  apiKey?: string;
  debug?: boolean;
}

@NgModule({
  declarations: [SemanticraftComponent, SemanticraftDirective],
  imports: [CommonModule],
  exports: [SemanticraftComponent, SemanticraftDirective],
  providers: [SemanticraftService]
})
export class SemanticraftModule {
  static forRoot(config: SemanticraftConfig = {}): ModuleWithProviders<SemanticraftModule> {
    return {
      ngModule: SemanticraftModule,
      providers: [
        {
          provide: 'SEMANTICCRAFT_CONFIG',
          useValue: config
        },
        SemanticraftService
      ]
    };
  }
}