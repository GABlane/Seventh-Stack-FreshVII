import type { FoodItem, StorageLocation } from '../../data/mockData'
import { FridgeShelf } from './FridgeShelf'

export function Fridge({ items, location }: { items: FoodItem[]; location: StorageLocation }) {
  void location
  return <FridgeShelf label="" items={items} />
}
