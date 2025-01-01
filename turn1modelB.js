
const WebSocket = require('ws');
const _ = require('lodash');

// Data structure to hold the inventory queue
const inventoryQueue = [];

// Async function to simulate processing an inventory update
async function processInventoryUpdate(item) {
  try {
    // Simulate some processing time using await setTimeout
    await new Promise(resolve => setTimeout(resolve, _.random(0, 1)));
    console.log(`Processed item: ${item}`);
  } catch (error) {
    console.error('Error processing inventory update:', error);
  }
}

// Function to push new items to the inventory queue and start processing if the queue is not empty
function enqueueInventoryUpdate(item) {
  inventoryQueue.push(item);

  if (inventoryQueue.length === 1) {
    // Start processing the queue if it's not already being processed
    processInventoryQueue();
  }
}

// Function to process the inventory queue FIFO
async function processInventoryQueue() {
  while (inventoryQueue.length) {
    const currentItem = inventoryQueue.shift();
    await processInventoryUpdate(currentItem);

    if (inventoryQueue.length) {
      // Continue processing if there are more items in the queue
      continue;
    }

    // Stop processing if the queue is empty
    break;
  }
}

// WebSocket server to listen for inventory updates from warehouse scanners
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', ws => {
  console.log('Warehouse scanner connected');

  ws.on('message', message => {
    try {
      // Parse the incoming inventory update message
      const item = JSON.parse(message);

      if (!_.isString(item)) {
        throw new Error('Invalid inventory update format');
      }

      enqueueInventoryUpdate(item);
    } catch (error) {
      console.error('Error handling inventory update message:', error);
      ws.send(JSON.stringify({ error: 'Invalid message format' }));
    }
  });

  ws.on('close', () => {
    console.log('Warehouse scanner disconnected');
  });
});

console.log('Inventory queue management system started.');
