import { TestBed } from '@angular/core/testing';

import { ServerDataService } from './serverdata.service';

describe('ServerdataService', () => {
  let service: ServerDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServerDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
