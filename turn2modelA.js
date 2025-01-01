const { performance } = require('perf_hooks');

class InventoryQueue {
    constructor() {
        this.queue = [];
        this.processing = false;
    }

    enqueue(item) {
        const enqueueTime = performance.now(); // Get the precise enqueue time
        this.queue.push({ item, enqueueTime });
        this.processQueue(); // Trigger processing
    }

    async processQueue() {
        if (this.processing || this.queue.length === 0) return;
        this.processing = true;

        while (this.queue.length > 0) {
            const { item, enqueueTime } = this.queue.shift(); // FIFO behavior
            await this.processItem(item, enqueueTime); // Pass enqueue time for latency measurement
        }

        this.processing = false;
    }

    async processItem(item, enqueueTime) {
        const startTime = performance.now(); // Track when processing starts

        return new Promise((resolve) => {
            // Simulate precise processing time of the inventory update
            const processingTime = Math.random() * 200; // Simulating processing time up to 200 microseconds with random delay
            const endTime = startTime + processingTime;

            // Use a high-resolution timer for precise timing
            const timer = setInterval(() => {
                // Check if the current time has reached the end time
                if (performance.now() >= endTime) {
                    clearInterval(timer);
                    const processingLatency = performance.now() - enqueueTime; // Calculate latency
                    console.log(`Processed item: ${item} at ${performance.now().toFixed(3)} ms | Latency: ${processingLatency.toFixed(3)} ms`);
                    resolve();
                }
            }, 0); // Fire as fast as possible without blocking
        });
    }
}

// In the main thread
const inventoryQueue = new InventoryQueue();

// Simulating warehouse scanner sending updates
setInterval(() => {
    const inventoryUpdate = Math.floor(Math.random() * 1000); // Simulate an inventory update
    inventoryQueue.enqueue(inventoryUpdate);
}, 1); // Send updates every millisecond
