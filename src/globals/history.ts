interface historyProp {
  title: string;
  content: string;
}

class History {
  list: historyProp[];
  constructor() {
    this.list = [];
  }
  get() {
    return this.list;
  }
  push(title: string, content: string): historyProp {
    let newList = { title, content };
    this.list.push(newList);
    return newList;
  }
}

const history = new History();

export default history;
