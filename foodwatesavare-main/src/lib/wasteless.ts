import { Product } from "@/data/mockData";

export type RiskLevel = "high" | "medium" | "low";
export type SmartAction = "flash_sale" | "heavy_discount" | "discount_bundle" | "donate" | "promote" | "stop_procurement" | "none";

export interface ProductAnalysis {
  product: Product;
  daysToExpiry: number;
  riskLevel: RiskLevel;
  riskScore: number; // 0-100 composite score
  predictedDemand: number;
  isOverstock: boolean;
  recommendedAction: string;
  smartAction: SmartAction;
  discountPercent: number;
  discountedPrice: number;
  salesVelocity: number; // ratio: dailySalesAvg / quantity
  overstockRatio: number; // quantity / predictedDemand
  expiryHours: number;
  promotionMessage: string;
  procurementAdvice: string;
  wasteRiskKg: number; // estimated waste in kg if no action
}

export function getDaysToExpiry(expiryDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function getHoursToExpiry(expiryDate: string): number {
  const now = new Date();
  const expiry = new Date(expiryDate);
  expiry.setHours(23, 59, 59);
  return Math.max(0, Math.round((expiry.getTime() - now.getTime()) / (1000 * 60 * 60)));
}

export function getRiskLevel(daysToExpiry: number): RiskLevel {
  if (daysToExpiry <= 2) return "high";
  if (daysToExpiry <= 5) return "medium";
  return "low";
}

export function getPredictedDemand(dailySalesAvg: number): number {
  return Math.round(dailySalesAvg * 3);
}

// ===== NEW: Composite Risk Score (0-100) =====
export function calculateRiskScore(
  daysToExpiry: number,
  quantity: number,
  predictedDemand: number,
  dailySalesAvg: number
): number {
  // Expiry component (0-40): closer to expiry = higher score
  const expiryScore = daysToExpiry <= 0 ? 40 : daysToExpiry <= 1 ? 36 : daysToExpiry <= 2 ? 30 : daysToExpiry <= 5 ? Math.max(0, 25 - (daysToExpiry - 2) * 5) : Math.max(0, 10 - daysToExpiry);

  // Overstock component (0-35): more surplus = higher score
  const overstockRatio = predictedDemand > 0 ? quantity / predictedDemand : 3;
  const overstockScore = overstockRatio <= 1 ? 0 : Math.min(35, Math.round((overstockRatio - 1) * 20));

  // Sales velocity component (0-25): slower sales = higher risk
  const velocityRatio = quantity > 0 ? dailySalesAvg / quantity : 1;
  const velocityScore = velocityRatio >= 0.5 ? 0 : Math.min(25, Math.round((1 - velocityRatio * 2) * 25));

  return Math.min(100, expiryScore + overstockScore + velocityScore);
}

// ===== NEW: Smart Action Engine =====
export function getSmartAction(
  daysToExpiry: number,
  isOverstock: boolean,
  salesVelocity: number,
  riskScore: number
): { action: string; smartAction: SmartAction; discount: number; promotionMessage: string; procurementAdvice: string } {
  // Flash sale: expiring in <= 1 day
  if (daysToExpiry <= 1) {
    return {
      action: "Flash Sale – 50% Off + Redirect surplus to NGO",
      smartAction: "flash_sale",
      discount: 50,
      promotionMessage: `🔥 FLASH SALE: 50% off! Expires ${daysToExpiry <= 0 ? "TODAY" : "TOMORROW"}!`,
      procurementAdvice: "Reduce next order by 40%",
    };
  }

  // Heavy discount: expiring in 2 days
  if (daysToExpiry <= 2) {
    return {
      action: "Apply 50% Discount Immediately",
      smartAction: "heavy_discount",
      discount: 50,
      promotionMessage: `⏰ 50% off – Only ${daysToExpiry} day(s) left!`,
      procurementAdvice: "Reduce next order by 30%",
    };
  }

  // Donate: unsold but still safe (overstock + low velocity + medium expiry)
  if (isOverstock && salesVelocity < 0.15 && daysToExpiry <= 5) {
    return {
      action: "Donate to NGO — Low demand, safe for consumption",
      smartAction: "donate",
      discount: 0,
      promotionMessage: "",
      procurementAdvice: "Stop procurement for this cycle",
    };
  }

  // Bundle offer: overstock with decent expiry
  if (daysToExpiry <= 5) {
    return {
      action: "Apply 20% Discount + Bundle Offer",
      smartAction: "discount_bundle",
      discount: 20,
      promotionMessage: `🎯 20% off + Bundle Deal! ${daysToExpiry} days left`,
      procurementAdvice: isOverstock ? "Reduce next order by 20%" : "Maintain current order",
    };
  }

  // Stop procurement: very low demand
  if (isOverstock && salesVelocity < 0.1) {
    return {
      action: "Stop Procurement — Demand too low",
      smartAction: "stop_procurement",
      discount: 0,
      promotionMessage: "",
      procurementAdvice: "Stop procurement until stock clears",
    };
  }

  // Promote: overstock but decent shelf life
  if (isOverstock) {
    return {
      action: "Promote in Featured Deals",
      smartAction: "promote",
      discount: 10,
      promotionMessage: `✨ Featured Deal: 10% off today!`,
      procurementAdvice: "Reduce next order by 15%",
    };
  }

  return {
    action: "No action needed",
    smartAction: "none",
    discount: 0,
    promotionMessage: "",
    procurementAdvice: "Maintain current order volume",
  };
}

export function analyzeProduct(product: Product): ProductAnalysis {
  const daysToExpiry = getDaysToExpiry(product.expiryDate);
  const expiryHours = getHoursToExpiry(product.expiryDate);
  const riskLevel = getRiskLevel(daysToExpiry);
  const predictedDemand = getPredictedDemand(product.dailySalesAvg);
  const isOverstock = product.quantity > predictedDemand;
  const salesVelocity = product.quantity > 0 ? product.dailySalesAvg / product.quantity : 1;
  const overstockRatio = predictedDemand > 0 ? product.quantity / predictedDemand : 3;

  const riskScore = calculateRiskScore(daysToExpiry, product.quantity, predictedDemand, product.dailySalesAvg);
  const { action, smartAction, discount, promotionMessage, procurementAdvice } = getSmartAction(daysToExpiry, isOverstock, salesVelocity, riskScore);
  const discountedPrice = +(product.price * (1 - discount / 100)).toFixed(2);

  // Estimate waste: if no action taken, surplus units * avg weight (0.5kg)
  const surplus = Math.max(0, product.quantity - predictedDemand);
  const wasteRiskKg = +(surplus * 0.5).toFixed(1);

  return {
    product, daysToExpiry, riskLevel, riskScore, predictedDemand, isOverstock,
    recommendedAction: action, smartAction, discountPercent: discount, discountedPrice,
    salesVelocity, overstockRatio, expiryHours, promotionMessage, procurementAdvice, wasteRiskKg,
  };
}

export function analyzeAllProducts(products: Product[]): ProductAnalysis[] {
  return products.map(analyzeProduct);
}

export function getStats(analyses: ProductAnalysis[]) {
  const totalItems = analyses.length;
  const highRisk = analyses.filter(a => a.riskLevel === "high").length;
  const mediumRisk = analyses.filter(a => a.riskLevel === "medium").length;
  const lowRisk = analyses.filter(a => a.riskLevel === "low").length;
  const atRisk = highRisk + mediumRisk;
  const discountedItems = analyses.filter(a => a.discountPercent > 0);
  const estimatedRevenueSaved = discountedItems.reduce((sum, a) => sum + a.discountedPrice * Math.min(a.product.quantity, a.predictedDemand), 0);
  const estimatedFoodSaved = discountedItems.reduce((sum, a) => sum + a.product.quantity, 0);

  return { totalItems, highRisk, mediumRisk, lowRisk, atRisk, estimatedRevenueSaved, estimatedFoodSaved };
}

// ===== Sustainability Impact Calculator =====
export function getSustainabilityMetrics(analyses: ProductAnalysis[], totalUnitsDonated: number) {
  const foodSavedKg = analyses
    .filter(a => a.discountPercent > 0 || a.smartAction === "donate")
    .reduce((sum, a) => sum + a.product.quantity * 0.5, 0);
  const donatedKg = totalUnitsDonated * 0.5;
  const totalFoodSavedKg = +(foodSavedKg + donatedKg).toFixed(1);

  // CO2: ~2.5 kg CO2 per kg food waste prevented (WRAP estimate)
  const co2Prevented = +(totalFoodSavedKg * 2.5).toFixed(1);

  // Meals: ~0.6 meals per kg of food
  const mealsEquivalent = Math.round(totalFoodSavedKg * 0.6);

  // Revenue from discounted sales
  const revenueRecovered = analyses
    .filter(a => a.discountPercent > 0)
    .reduce((sum, a) => sum + a.discountedPrice * Math.min(a.product.quantity, a.predictedDemand), 0);

  // Water saved: ~1000L per kg food (average)
  const waterSavedLiters = Math.round(totalFoodSavedKg * 1000);

  return { totalFoodSavedKg, co2Prevented, mealsEquivalent, revenueRecovered: +revenueRecovered.toFixed(0), waterSavedLiters, donatedKg };
}

// ===== Warehouse Heatmap Data =====
export function getWarehouseRiskData(analyses: ProductAnalysis[]) {
  const warehouseMap: Record<string, { total: number; highRisk: number; mediumRisk: number; lowRisk: number; avgRiskScore: number; totalWasteKg: number; scores: number[] }> = {};

  analyses.forEach(a => {
    const wh = a.product.warehouse;
    if (!warehouseMap[wh]) warehouseMap[wh] = { total: 0, highRisk: 0, mediumRisk: 0, lowRisk: 0, avgRiskScore: 0, totalWasteKg: 0, scores: [] };
    warehouseMap[wh].total++;
    warehouseMap[wh].scores.push(a.riskScore);
    warehouseMap[wh].totalWasteKg += a.wasteRiskKg;
    if (a.riskLevel === "high") warehouseMap[wh].highRisk++;
    else if (a.riskLevel === "medium") warehouseMap[wh].mediumRisk++;
    else warehouseMap[wh].lowRisk++;
  });

  return Object.entries(warehouseMap).map(([name, data]) => ({
    name,
    ...data,
    avgRiskScore: Math.round(data.scores.reduce((s, v) => s + v, 0) / data.scores.length),
    totalWasteKg: +data.totalWasteKg.toFixed(1),
  }));
}

// ===== Waste Prediction =====
export function getWastePrediction(analyses: ProductAnalysis[]) {
  const tomorrow = analyses.filter(a => a.daysToExpiry <= 1);
  const threeDays = analyses.filter(a => a.daysToExpiry <= 3);
  const week = analyses.filter(a => a.daysToExpiry <= 7);

  const calcWaste = (items: ProductAnalysis[]) => {
    const kg = items.reduce((s, a) => s + Math.max(0, a.product.quantity - a.predictedDemand) * 0.5, 0);
    return +kg.toFixed(1);
  };

  return {
    tomorrow: { items: tomorrow.length, wasteKg: calcWaste(tomorrow) },
    threeDays: { items: threeDays.length, wasteKg: calcWaste(threeDays) },
    week: { items: week.length, wasteKg: calcWaste(week) },
  };
}

// ===== NGO Smart Matching =====
export function matchProductToNGO(
  product: ProductAnalysis,
  ngos: { name: string; acceptedCategories: string[]; capacity: string }[]
): { ngoName: string; matchScore: number; reason: string } | null {
  const matches = ngos
    .filter(ngo => ngo.acceptedCategories.includes(product.product.category))
    .map(ngo => {
      let score = 50; // base for category match
      // Capacity parsing (e.g., "500 kg/week")
      const capMatch = ngo.capacity.match(/(\d+)/);
      const cap = capMatch ? parseInt(capMatch[1]) : 100;
      if (product.product.quantity * 0.5 <= cap * 0.3) score += 30; // fits well within capacity
      else if (product.product.quantity * 0.5 <= cap) score += 15;
      // Urgency bonus
      if (product.daysToExpiry <= 1) score += 20;
      else if (product.daysToExpiry <= 3) score += 10;
      return { ngoName: ngo.name, matchScore: Math.min(100, score), reason: `Category match + ${cap}kg capacity` };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  return matches[0] || null;
}
