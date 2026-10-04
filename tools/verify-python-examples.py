"""Syntax and async ownership checks; does not substitute for FastAPI/NumPy tests."""
import ast
import asyncio
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
document = (ROOT / 'docs/superpowers/plans/2026-09-27-psychological-trauma-simulation.md').read_text(encoding='utf-8')
blocks = re.findall(r'```python\s*\n(.*?)```', document, re.S)
for number, block in enumerate(blocks, 1):
    compile(block, f'embedded-python-{number}', 'exec')
print(f'PASS syntax: {len(blocks)} embedded Python blocks')

main = next(block for block in blocks if 'async def simulation_loop()' in block)
tree = ast.parse(main)
functions = [node for node in tree.body if isinstance(node, ast.AsyncFunctionDef)
             and node.name in ('simulation_loop', 'websocket_stream')]
for function in functions:
    function.decorator_list = []
module = ast.fix_missing_locations(ast.Module(body=functions, type_ignores=[]))

class Disconnected(Exception):
    pass

class Engine:
    dt = 0.01

    def __init__(self, done):
        self.count = 0
        self.done = done

    def step(self):
        self.count += 1
        if self.count == 20:
            self.done.set()
            self.task.cancel()  # Deterministic stop at the requested step boundary.
        return {'t': self.count * self.dt, 'state': self.count}

class Socket:
    def __init__(self, slow=False):
        self.packets = []
        self.slow = slow

    async def accept(self):
        pass

    async def send_json(self, packet):
        self.packets.append(packet)
        if self.slow:
            await asyncio.sleep(0.004)
        if len(self.packets) >= 4:
            raise Disconnected()

async def scenario(viewers):
    done = asyncio.Event()
    engine = Engine(done)
    namespace = {'asyncio': asyncio, 'engine': engine, 'latest_packet': None,
                 'subscribers': set(), 'WebSocket': Socket, 'WebSocketDisconnect': Disconnected}
    exec(compile(module, 'extracted-clock-functions', 'exec'), namespace)
    sockets = [Socket(slow=(i == 1)) for i in range(viewers)]
    clients = [asyncio.create_task(namespace['websocket_stream'](socket)) for socket in sockets]
    task = asyncio.create_task(namespace['simulation_loop']())
    engine.task = task
    await asyncio.wait_for(done.wait(), timeout=2)
    task.cancel()
    await asyncio.gather(task, return_exceptions=True)
    for client in clients:
        client.cancel()
    await asyncio.gather(*clients, return_exceptions=True)
    assert engine.count == 20
    assert namespace['latest_packet']['t'] == 0.20
    assert namespace['subscribers'] == set(), 'disconnect/cancellation must unregister subscribers'
    for socket in sockets:
        assert socket.packets
        states = [packet['state'] for packet in socket.packets]
        assert states == sorted(set(states))
    print(f'PASS extracted async ownership: {viewers} viewers, 20 engine steps, cleanup complete')

async def run():
    for viewers in (0, 1, 2):
        await scenario(viewers)

asyncio.run(run())
