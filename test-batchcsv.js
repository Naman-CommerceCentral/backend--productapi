import { fetchProductDetails } from './server/router/index.js';  // Import from your existing file

// Array of UPC codes to test
const upcCodes = [
    '86279043238', '15586834185', '30734826041', '63562598897',
    '84297120993'
];

async function testBatchProcessing() {
    console.log(`Starting batch processing test for ${upcCodes.length} UPC codes...`);

    console.time('Batch Processing Time');

    try {
        // Fetch product details for all UPCs in parallel using Promise.allSettled
        const productPromises = upcCodes.map(upc => fetchProductDetails(upc));
        const results = await Promise.allSettled(productPromises);

        console.timeEnd('Batch Processing Time');

        // Analyze the results
        const successful = results.filter(result => result.status === 'fulfilled').length;
        const failed = results.filter(result => result.status === 'rejected').length;

        console.log(`\nResults Summary:`);
        console.log(`- Total UPCs processed: ${upcCodes.length}`);
        console.log(`- Successfully processed: ${successful}`);
        console.log(`- Failed to process: ${failed}`);

        // Print details of each result
        console.log('\nDetailed Results:');
        results.forEach((result, index) => {
            const upc = upcCodes[index];
            if (result.status === 'fulfilled') {
                const product = result.value;
                console.log(`\n✅ UPC ${upc}: Successfully fetched`);
                console.log(`  - Title: "${product.title}"`);
                console.log(`  - UPC: ${product.upc}`);
                console.log(`  - Price: ${product.price}`);
            } else {
                console.log(`❌ UPC ${upc}: Failed - ${result.reason.message}`);
            }
        });

        // Return the actual product data for further inspection if needed
        return results.map((result, index) => {
            if (result.status === 'fulfilled') {
                return result.value;
            } else {
                return {
                    upc: upcCodes[index],
                    title: "Failed to fetch product details",
                    image: "No image available",
                    price: "Price not available",
                    error: result.reason.message
                };
            }
        });

    } catch (error) {
        console.error('Error in batch processing test:', error);
        return null;
    }
}

// Run the test
testBatchProcessing()
    .then(products => {
        console.log('\nTest completed. Full product data available in returned object.');
    })
    .catch(error => {
        console.error('Test failed with error:', error);
    });