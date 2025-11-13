import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fond } from '../fonds/entities/fond.entity';
import { Inventory } from '../inventories/entities/inventory.entity';
import { Record } from '../records/entities/record.entity';
import { Request } from '../requests/entities/request.entity';
import { User } from '../users/entities/user.entity';
import { DigitalCopy } from '../digital-copies/entities/digital-copy.entity';
import { RequestStatus } from '../common/enums/request-status.enum';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Fond)
    private fondsRepository: Repository<Fond>,
    @InjectRepository(Inventory)
    private inventoriesRepository: Repository<Inventory>,
    @InjectRepository(Record)
    private recordsRepository: Repository<Record>,
    @InjectRepository(Request)
    private requestsRepository: Repository<Request>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(DigitalCopy)
    private digitalCopiesRepository: Repository<DigitalCopy>,
  ) {}

  async getGeneralStats(userRole: Role) {
    const [
      fondsCount,
      inventoriesCount,
      recordsCount,
      digitalCopiesCount,
      usersCount,
      requestsCount,
    ] = await Promise.all([
      this.fondsRepository.count(),
      this.inventoriesRepository.count(),
      this.recordsRepository.count(),
      this.digitalCopiesRepository.count(),
      userRole === Role.ADMIN ? this.usersRepository.count() : Promise.resolve(null),
      this.requestsRepository.count(),
    ]);

    const stats: any = {
      fonds: fondsCount,
      inventories: inventoriesCount,
      records: recordsCount,
      digitalCopies: digitalCopiesCount,
      requests: requestsCount,
    };

    if (userRole === Role.ADMIN) {
      stats.users = usersCount;
    }

    return stats;
  }

  async getRequestsStats() {
    const [newRequests, inProgressRequests, completedRequests] = await Promise.all([
      this.requestsRepository.count({ where: { status: RequestStatus.NEW } }),
      this.requestsRepository.count({
        where: { status: RequestStatus.IN_PROGRESS },
      }),
      this.requestsRepository.count({
        where: { status: RequestStatus.COMPLETED },
      }),
    ]);

    return {
      new: newRequests,
      inProgress: inProgressRequests,
      completed: completedRequests,
      total: newRequests + inProgressRequests + completedRequests,
    };
  }

  async getRecordsByFond() {
    const fonds = await this.fondsRepository.find({
      relations: ['inventories', 'inventories.records'],
    });

    return fonds.map((fond) => ({
      fondId: fond.id,
      fondCode: fond.code,
      fondTitle: fond.title,
      recordsCount: fond.inventories.reduce(
        (sum, inv) => sum + (inv.records?.length || 0),
        0,
      ),
    }));
  }

  async getRecordsByYear() {
    const records = await this.recordsRepository.find({
      where: {},
      select: ['id', 'dateFrom'],
    });

    // Group records by year
    const yearMap = new Map<number, number>();

    records.forEach((record) => {
      if (record.dateFrom) {
        const year = new Date(record.dateFrom).getFullYear();
        if (!isNaN(year) && year > 1000 && year < 3000) {
          yearMap.set(year, (yearMap.get(year) || 0) + 1);
        }
      }
    });

    // Convert to array and sort by year
    const result = Array.from(yearMap.entries())
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => a.year - b.year);

    return result;
  }
}

