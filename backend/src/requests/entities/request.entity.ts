import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Record } from '../../records/entities/record.entity';
import { User } from '../../users/entities/user.entity';
import { RequestType } from '../../common/enums/request-type.enum';
import { RequestStatus } from '../../common/enums/request-status.enum';

@Entity('requests')
export class Request {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  recordId: number;

  @ManyToOne(() => Record, (record) => record.requests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recordId' })
  record: Record;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.requests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: RequestType,
  })
  type: RequestType;

  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.NEW,
  })
  status: RequestStatus;

  @Column({ nullable: true })
  rejectionReason: string;

  @Column({ nullable: true })
  processedById: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'processedById' })
  processedBy: User;

  @Column({ nullable: true })
  processedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

