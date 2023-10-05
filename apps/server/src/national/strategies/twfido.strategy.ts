import { Injectable } from '@nestjs/common/decorators';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from '@tw-did/passport-twfido';
import { NationalService } from '../national.service';

interface TwFidoStrategyOptions {
  apiKey: string;
  serviceId: string;
  apiUrl: string;
}

@Injectable()
export class TwFidoStrategy extends PassportStrategy(Strategy as any) {
  constructor(
    private nationalService: NationalService,
    private options: TwFidoStrategyOptions
  ) {
    super(options);
  }

  async validate(nationalId: string) {
    return { nationalId };
  }
}
