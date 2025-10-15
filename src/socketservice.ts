import { time } from "console";
import { io, Socket } from "socket.io-client";
const SERVER_URL = "http://localhost:3000";

export class SocketService {
    // The single instance of the class.
    private static instance: SocketService;
    private socket: Socket;
    private isConnected: boolean = false;
    private constructor() {
        this.socket = io(SERVER_URL, { autoConnect: false, reconnectionDelay: 2000, reconnectionAttempts: Infinity,randomizationFactor: 0.5, reconnection: true });
        this.socket.on('connect', () => {
            this.isConnected = true;
            console.log("Socket Service: Successfully connected to the server.");
        });
        this.socket.on('disconnect', (reason) => {
            this.isConnected = false;
            console.log(`Socket Service: Disconnected from the server. Reason: ${reason}`);
        });

        this.socket.on('connect_error', (err: any) => {
            this.isConnected = false;
            console.error(`Socket Service: Connection failed. Reason: ${err.message}`);
        });
    }
    static async getInstance(): Promise<SocketService> {
        if (!SocketService.instance) SocketService.instance = new SocketService();
        return SocketService.instance;
    }
/*
    static async init(): Promise<void> {
        const instance = await SocketService.getInstance();
        // Wait for the connection to be established
        if (!instance.isConnected && !instance.socket.connected) {
            instance.socket.connect();
            await new Promise<void>((resolve, reject) => {
                // Check every 100ms if the connection is ready
                const timeout = setTimeout(() => {
                    reject(new Error('connection timeout'));
                }, 6000);
                instance.socket.once('connect', () => {
                    clearTimeout(timeout);
                    resolve();
                });
                instance.socket.once('connect_error', (err) => {
                    clearTimeout(timeout);
                    reject(err);
                })
            });
        }
    }
*/

    // Simplified, cleaner init using async/await and built-in events
static async init(): Promise<void> {
    const instance = await SocketService.getInstance();
    if (!instance.socket.connected) {
        instance.socket.connect();
    }
    
    // Create a Promise that resolves on 'connect' or rejects on 'connect_error'
    await new Promise<void>((resolve, reject) => {
        // Only wait if a connection is currently being attempted or is not yet connected
        if (instance.socket.connected) return resolve();

        // Use a standard timeout for the initial connection attempt
        const timeout = setTimeout(() => {
            instance.socket.off('connect', onConnect);
            reject(new Error('Initial connection timeout (6s)'));
        }, 6000);

        const onConnect = () => {
            clearTimeout(timeout);
            resolve();
        };

        instance.socket.once('connect', onConnect);
        instance.socket.once('connect_error', (err) => {
             clearTimeout(timeout);
             reject(err);
        });
    });
}
    public disconnect(): void {
        if (this.socket.connected) this.socket.disconnect();
    }

    public emit(eventName: string, payload: any): void {
        if (this.socket.connected) {
        this.socket.emit(eventName, payload);
    }
    }

    public on(eventName: string, listener: (...args: any[]) => void): void {
        this.socket.on(eventName, listener);
    }
public off(eventName: string, listener: (...args: any[]) => void): void {
        this.socket.off(eventName,listener);
    }

    public once(eventName: string, listener: (...args: any[]) => void): void {
        this.socket.once(eventName, listener);
    }
    
}
