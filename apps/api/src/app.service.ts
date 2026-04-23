import { Injectable } from '@nestjs/common';

export type HealthResponse = {
  success: true;
  data: {
    status: 'ok';
    timestamp: string;
  };
};

@Injectable()
export class AppService {
  getHealth(): HealthResponse {
    return {
      success: true,
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
      },
    };
  }
}
