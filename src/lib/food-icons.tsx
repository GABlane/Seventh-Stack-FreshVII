import {
  Apple,
  Banana,
  Bean,
  Beef,
  Box,
  Broccoli,
  Carrot,
  CookingPot,
  Egg,
  Fish,
  Milk,
  PackageOpen,
  Salad,
  Soup,
  Wheat,
  type LucideIcon,
} from 'lucide-react'

type FoodIconInput = {
  name: string
  category?: string
}

type FoodIconMatch = {
  pattern: RegExp
  icon: LucideIcon
}

const foodIconMatches: FoodIconMatch[] = [
  { pattern: /banana/, icon: Banana },
  { pattern: /apple|pear|peach|plum|mango|orange|lemon|lime|berry|grape|melon|fruit/, icon: Apple },
  { pattern: /broccoli|spinach|lettuce|kale|cabbage|leafy|vegetable/, icon: Broccoli },
  { pattern: /carrot/, icon: Carrot },
  { pattern: /milk|yog(?:h)?urt|cheese|butter|cream|dairy/, icon: Milk },
  { pattern: /egg/, icon: Egg },
  { pattern: /chicken|beef|pork|turkey|lamb|meat|sausage|bacon/, icon: Beef },
  { pattern: /fish|salmon|tuna|shrimp|prawn|seafood/, icon: Fish },
  { pattern: /bean|lentil|chickpea|tofu/, icon: Bean },
  { pattern: /bread|rice|pasta|noodle|cereal|oat|flour|grain|granola/, icon: Wheat },
  { pattern: /soup|stew|curry|broth/, icon: Soup },
  { pattern: /salad/, icon: Salad },
  { pattern: /leftover|meal|prepared|cooked/, icon: CookingPot },
]

const categoryIcons: FoodIconMatch[] = [
  { pattern: /produce|fruit/, icon: Apple },
  { pattern: /vegetable/, icon: Broccoli },
  { pattern: /dairy/, icon: Milk },
  { pattern: /protein|meat/, icon: Beef },
  { pattern: /seafood/, icon: Fish },
  { pattern: /grain|bakery|pantry/, icon: Wheat },
  { pattern: /prepared|leftover/, icon: CookingPot },
]

export function foodIconFor({ name, category = '' }: FoodIconInput): LucideIcon {
  const normalizedName = name.toLowerCase()
  const normalizedCategory = category.toLowerCase()

  return foodIconMatches.find(({ pattern }) => pattern.test(normalizedName))?.icon
    ?? categoryIcons.find(({ pattern }) => pattern.test(normalizedCategory))?.icon
    ?? Box
}

export function FoodIcon({ name, category, className, size = 22 }: FoodIconInput & { className?: string; size?: number }) {
  const Icon = foodIconFor({ name, category })
  return <Icon aria-hidden="true" className={className} size={size} strokeWidth={2.2} />
}

export const fallbackFoodIcon = PackageOpen
