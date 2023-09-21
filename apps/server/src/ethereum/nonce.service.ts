import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Nonce } from './nonce.schema';
import { Injectable, NotFoundException } from '@nestjs/common';
import { getRandomHexString } from '../utils';
import { Request } from 'express';

type Callback<T> = (
  error: Error | null,
  result?: T,
  info?: { message: string }
) => void;

@Injectable()
export class NonceService {
  constructor(@InjectModel(Nonce.name) private nonceModel: Model<Nonce>) {}

  challenge(): Promise<Nonce> {
    const nonce = new this.nonceModel();
    nonce.value = getRandomHexString();
    return nonce.save();
  }

  async verify(_req: Request, nonceValue: string, cb?: Callback<boolean>) {
    const nonce = await this.nonceModel
      .findOneAndDelete({ value: nonceValue })
      .exec();

    // this callback hander is for compatible of passport-siwe
    if (!nonce) {
      const error = new NotFoundException('Nonce not found');
      if (cb) {
        cb(error, false);
      }
      throw error;
    }

    if (cb) {
      cb(null, true);
    }
    return true;
  }
}
