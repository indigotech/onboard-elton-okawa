import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  birthDate: Date;

  @Column()
  cpf: string;

  @Column()
  password: string;
}