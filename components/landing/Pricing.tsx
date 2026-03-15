"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Check, X } from "lucide-react";
import { motion, useInView } from "framer-motion";

const plans = [
  {
    name: "Free",
    description: "Perfect for getting started",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      { text: "50 items", included: true },
      { text: "3 collections", included: true },
      { text: "Snippets, Prompts, Commands, Notes, Links", included: true },
      { text: "Basic search", included: true },
      { text: "File & Image uploads", included: false },
      { text: "AI features", included: false },
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    description: "For serious developers",
    monthlyPrice: 8,
    yearlyPrice: 6,
    features: [
      { text: "Unlimited items", included: true },
      { text: "Unlimited collections", included: true },
      { text: "All item types including Files & Images", included: true },
      { text: "AI auto-tagging & summaries", included: true },
      { text: "\"Explain This Code\"", included: true },
      { text: "AI Prompt Optimizer", included: true },
      { text: "Data export (JSON/ZIP)", included: true },
    ],
    cta: "Start Free Trial",
    popular: true,
  },
];

export function Pricing() {
  const [isYearly, setIsYearly] = useState(false);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });

  const headerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
      },
    },
  };

  const toggleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const,
        delay: 0.1,
      },
    },
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <section id="pricing" className="py-16 md:py-24" ref={sectionRef}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={headerVariants}
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            <span className="text-foreground">Simple, Transparent </span>
            <span className="text-gradient-warm">Pricing</span>
          </h2>
          <p className="text-muted-foreground">
            Start free. Upgrade when you need more power.
          </p>
        </motion.div>

        {/* Toggle */}
        <motion.div 
          className="flex items-center justify-center gap-4 mb-12"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={toggleVariants}
        >
          <span className={`text-sm ${!isYearly ? "text-foreground" : "text-muted-foreground"}`}>
            Monthly
          </span>
          <Switch
            checked={isYearly}
            onCheckedChange={setIsYearly}
          />
          <span className={`text-sm ${isYearly ? "text-foreground" : "text-muted-foreground"}`}>
            Yearly
          </span>
          {isYearly && (
            <Badge variant="secondary" className="bg-green-500/20 text-green-500 border-green-500/30">
              Save 25%
            </Badge>
          )}
        </motion.div>

        {/* Pricing Cards */}
        <motion.div 
          className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {plans.map((plan) => (
            <motion.div key={plan.name} variants={cardVariants}>
              <Card
                className={`p-8 relative h-full ${
                  plan.popular
                    ? "border-accent/50 glow-amber"
                    : "border-border/50"
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground">
                    Most Popular
                  </Badge>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-foreground mb-1">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-foreground">
                      ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex items-start gap-3">
                      {feature.included ? (
                        <div className="size-5 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5">
                          <Check className="size-3 text-green-500" />
                        </div>
                      ) : (
                        <div className="size-5 rounded-full bg-muted flex items-center justify-center mt-0.5">
                          <X className="size-3 text-muted-foreground" />
                        </div>
                      )}
                      <span className={feature.included ? "text-foreground" : "text-muted-foreground"}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${
                    plan.popular
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground glow-coral"
                      : "bg-muted hover:bg-muted/80 text-foreground"
                  }`}
                >
                  {plan.cta}
                </Button>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
