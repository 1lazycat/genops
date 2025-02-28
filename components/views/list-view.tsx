import React, { useState } from 'react';
import { Bot } from 'lucide-react';

interface Item {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  created: string;
  modified: string;
  children?: Item[];
}

const ListView = () => {
  const [items, setItems] = useState<Item[]>([
    // Sample data
    { id: 1, title: 'Epic 1', description: 'Description 1', status: 'Open', priority: 'High', created: '2023-01-01', modified: '2023-01-02', children: [
      { id: 2, title: 'User Story 1', description: 'Description 2', status: 'In Progress', priority: 'Medium', created: '2023-01-03', modified: '2023-01-04', children: [
        { id: 3, title: 'Task 1', description: 'Description 3', status: 'Done', priority: 'Low', created: '2023-01-05', modified: '2023-01-06' },
        { id: 4, title: 'Task 2', description: 'Description 4', status: 'Open', priority: 'High', created: '2023-01-07', modified: '2023-01-08' }
      ] }
    ] }
  ]);

  const renderItems = (items: Item[]) => {
    return items.map((item: Item) => (
      <div key={item.id} className="p-4 border rounded mb-2">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold">{item.title}</h3>
            <p>{item.description}</p>
            <p>Status: {item.status}</p>
            <p>Priority: {item.priority}</p>
            <p>Created: {item.created}</p>
            <p>Modified: {item.modified}</p>
          </div>
          <button className="ml-4 p-2 bg-blue-500 text-white rounded"><Bot /></button>
        </div>
        {item.children && <div className="ml-4 mt-2">{renderItems(item.children)}</div>}
      </div>
    ));
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">List View</h2>
      {renderItems(items)}
    </div>
  );
};

export { ListView };
