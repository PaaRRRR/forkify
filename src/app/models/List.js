import uniqid from 'uniqid'

class List {
  constructor() {
    this.items = [];
  }

  addItem(count, unit, ingredient) {
    const item = {
      id: uniqid(),
      count,
      unit,
      ingredient
    }
    this.items.push(item);
    return item;
  }

  deleteItem(id) {
    this.items = this.items.filter(el => el.id !== id);
  }

  updateCount(id, newCount) {
    this.items.find(el => el.id === id).count = newCount;
  }
  
}

export default List
