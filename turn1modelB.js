const { Worker, isMainThread, parentPort } = require('worker_threads');
const { performance } = require('perf_hooks');
const MAX_QUEUE_SIZE = 1000;

class InventoryQueue {
    constructor() {
        this.queue = [];
        this.processing = false;
    }

    enqueue(item) {
        this.queue.push(item);
        this.processQueue(); // Trigger processing
    }

    async processQueue() {
        if (this.processing || this.queue.length === 0) return;
        this.processing = true;

        while (this.queue.length > 0) {
            const item = this.queue.shift(); // FIFO behavior
            await this.processItem(item);
            // Batch processing can be done here if needed
        }

        this.processing = false;
    }

    async processItem(item) {
        return new Promise((resolve) => {
            // Simulate processing time of the inventory update
            const processingTime = Math.random() * 10; // In milliseconds
            setTimeout(() => {
                console.log(`Processed item: ${item} at ${performance.now()} ms`);
                resolve();
            }, processingTime);
        });
    }
}

// In the main thread
if (isMainThread) {
    const inventoryQueue = new InventoryQueue();

    // Simulating warehouse scanner sending updates
    setInterval(() => {
        const inventoryUpdate = Math.floor(Math.random() * 1000); // Simulate an inventory update
        inventoryQueue.enqueue(inventoryUpdate);
    }, 1); // Send updates every millisecond
} else {
    // In worker threads, you can handle more work or processing separately
}
