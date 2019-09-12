import { Resolver, Query, Arg } from "type-graphql";

@Resolver()
export class HelloResolver {

  @Query(returns => String)
  Hello(@Arg("name", { nullable: true }) name: string) {
    return name ? `Hello, ${name}!` : 'Hello, world!';
  }
}