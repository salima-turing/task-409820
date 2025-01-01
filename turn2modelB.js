const { Worker, isMainThread, parentPort } = require('worker_threads');
const { performance } = require('perf_hooks');
const MAX_QUEUE_SIZE = 1000;

class InventoryQueue {
    constructor() {
        this.queue = [];
        this.processing = false;
        this.latencyMetrics = [];
    }

    enqueue(item) {
        const enqueueTime = performance.now();
        this.queue.push({ item, enqueueTime });
        this.processQueue();
    }

    async processQueue() {
        if (this.processing || this.queue.length === 0) return;
        this.processing = true;

        while (this.queue.length > 0) {
            const { item, enqueueTime } = this.queue.shift();
            const startProcessTime = performance.now();
            await this.processItem(item);
            const endProcessTime = performance.now();
            this.recordLatency(enqueueTime, startProcessTime, endProcessTime);
        }

        this.processing = false;
    }

    async processItem(item) {
        return new Promise((resolve) => {
            // Simulate processing time of the inventory update using random time between 0.1 and 10 milliseconds
            const processingTime = Math.random() * 10 + 0.1; // In milliseconds
            setTimeout(() => {
                console.log(`Processed item: ${item}`);
                resolve();
            }, processingTime);
        });
    }

    recordLatency(enqueueTime, startProcessTime, endProcessTime) {
        // Calculate latency in microseconds
        const enqueueLatency = (startProcessTime - enqueueTime) * 1000; // In microseconds
        const processingLatency = (endProcessTime - startProcessTime) * 1000; // In microseconds
        const totalLatency = enqueueLatency + processingLatency;

        this.latencyMetrics.push({
            enqueueTime: enqueueTime.toFixed(3),
            startProcessTime: startProcessTime.toFixed(3),
            endProcessTime: endProcessTime.toFixed(3),
            enqueueLatency: enqueueLatency.toFixed(3),
            processingLatency: processingLatency.toFixed(3),
            totalLatency: totalLatency.toFixed(3),
        });

        console.log(`Latency Metrics: ${JSON.stringify(this.latencyMetrics[this.latencyMetrics.length - 1])}`);
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
