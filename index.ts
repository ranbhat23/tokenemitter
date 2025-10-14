// Assuming  SocketService) export an update 
// OR import the SocketService class and use the instance method
import { SocketService } from './SocketService';

async function runUpdate() {
    // process.argv is an array: [node path, script path, arg1, arg2, ...]
    // The token should be at index 2
    const newToken = process.argv[2]; 

    if (!newToken) {
        console.error('Error: Token string not provided.');
        console.error('Usage: ts-node updateToken.ts <NEW_TOKEN_STRING>');
        process.exit(1); // Exit with failure
    }

    try {
        // 1. Initialize the SocketService to ensure a connection is established
        await SocketService.init(); 

        // 2. Get the connected instance
        const instance = await SocketService.getInstance();
        
        // 3. Emit the special event to the server
        // The server is responsible for broadcasting this to ALL PM2 processes
        instance.emit('admin:updateToken', { newToken });

        // Optional: Update the local process's memory as well (if you implemented the local update)
        // updateToken(newToken); 

        console.log(`Successfully sent new token to server for broadcast: ${newToken.substring(0, 8)}...`);
        
    } catch (error) {
        console.error('Failed to update token via Socket.IO:', error);
        process.exit(1);
    }
}

runUpdate();
