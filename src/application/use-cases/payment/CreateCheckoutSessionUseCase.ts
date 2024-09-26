// src/application/use-cases/CreateCheckoutSessionUseCase.ts

import { IUserRepository } from "../../../domain/repo/IUserRepository";
import { IStripeGateway } from "../../../domain/services/IStripeGateway";

export class CreateCheckoutSessionUseCase {
  constructor(
    private userRepository: IUserRepository,
    private stripeGateway: IStripeGateway,
  ) {}

  async execute(userId: string): Promise<{ sessionId: string }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      customerId = await this.stripeGateway.createCustomer(
        user.email,
        user.name,
      );
      user.stripeCustomerId = customerId;
      await this.userRepository.update(user);
    }

    const session = await this.stripeGateway.createCheckoutSession(customerId);
    return { sessionId: session.id };
  }
}