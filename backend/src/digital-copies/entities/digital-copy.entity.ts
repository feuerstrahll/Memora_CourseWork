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

@Entity('digital_copies')
export class DigitalCopy {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  recordId: number;

  @ManyToOne(() => Record, (record) => record.digitalCopies, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'recordId' })
  record: Record;

  @Column()
  uri: string;

  @Column()
  mimeType: string;

  @Column({ type: 'bigint' })
  filesize: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

