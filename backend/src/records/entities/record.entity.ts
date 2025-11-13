import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Inventory } from '../../inventories/entities/inventory.entity';
import { Keyword } from '../../keywords/entities/keyword.entity';
import { DigitalCopy } from '../../digital-copies/entities/digital-copy.entity';
import { Request } from '../../requests/entities/request.entity';
import { AccessLevel } from '../../common/enums/access-level.enum';

@Entity('records')
export class Record {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  inventoryId: number;

  @ManyToOne(() => Inventory, (inventory) => inventory.records, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'inventoryId' })
  inventory: Inventory;

  @Column()
  refCode: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  annotation: string;

  @Column({ type: 'date', nullable: true })
  dateFrom: Date;

  @Column({ type: 'date', nullable: true })
  dateTo: Date;

  @Column({ nullable: true })
  extent: string;

  @Column({
    type: 'enum',
    enum: AccessLevel,
    default: AccessLevel.PUBLIC,
  })
  accessLevel: AccessLevel;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => Keyword, (keyword) => keyword.records)
  @JoinTable({
    name: 'record_keywords',
    joinColumn: { name: 'recordId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'keywordId', referencedColumnName: 'id' },
  })
  keywords: Keyword[];

  @OneToMany(() => DigitalCopy, (copy) => copy.record)
  digitalCopies: DigitalCopy[];

  @OneToMany(() => Request, (request) => request.record)
  requests: Request[];
}

