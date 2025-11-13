import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Fond } from '../../fonds/entities/fond.entity';
import { Record } from '../../records/entities/record.entity';

@Entity('inventories')
export class Inventory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fondId: number;

  @ManyToOne(() => Fond, (fond) => fond.inventories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fondId' })
  fond: Fond;

  @Column()
  number: string;

  @Column()
  title: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Record, (record) => record.inventory)
  records: Record[];
}

