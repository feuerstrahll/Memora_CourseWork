import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Role } from '../../common/enums/role.enum';
import { Request } from '../../requests/entities/request.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  fullName: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.RESEARCHER,
  })
  role: Role;

  // Личная информация исследователя
  @Column({ nullable: true })
  occupation: string; // Род деятельности

  @Column({ nullable: true })
  workplace: string; // Место работы

  @Column({ nullable: true })
  position: string; // Должность

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Request, (request) => request.user)
  requests: Request[];
}

