import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ObjectType, Field, ID} from 'type-graphql';

@ObjectType()
@Entity()
export class User {

  @Field(type => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column({ unique: true })
  email: string;

  @Field(type => String)
  @Column()
  birthDate: Date;

  @Field()
  @Column()
  cpf: string;

  @Column()
  password: string;
}