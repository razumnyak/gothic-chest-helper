const ALGORITHM_BFS = "bfs";
const ALGORITHM_PLATE_TRAVEL = "plate-travel";
const ALGORITHM_FEWER_SWITCHES_FAST = "fewer-switches-fast";
const ALGORITHM_WASD = "wasd";

self.addEventListener("message", (event) => {
    const { type, requestId } = event.data ?? {};

    if (type !== "solve") {
        return;
    }

    try {
        const solution = solve(event.data);

        self.postMessage({
            type: "solved",
            requestId,
            algorithm: event.data.algorithm,
            solution,
        });
    } catch (error) {
        self.postMessage({
            type: "failed",
            requestId,
            algorithm: event.data.algorithm,
            reason: error instanceof Error ? error.message : String(error),
        });
    }
});

function solve(config) {
    const normalized = normalizeConfig(config);

    if (isGoal(normalized.initialPositions, normalized)) {
        return [];
    }

    if (normalized.algorithm === ALGORITHM_PLATE_TRAVEL) {
        return findWeightedSolution(normalized, createPlateTravelCost);
    }

    if (normalized.algorithm === ALGORITHM_FEWER_SWITCHES_FAST) {
        return findFewerSwitchesFastSolution(normalized);
    }

    if (normalized.algorithm === ALGORITHM_WASD) {
        return findWeightedSolution(normalized, createWasdCost);
    }

    return findBfsSolutionOptimized(normalized);
}

function normalizeConfig(config) {
    const rawAlgorithm = config.algorithm;
    const algorithm = rawAlgorithm === "shortest-fewer-switches"
        ? ALGORITHM_PLATE_TRAVEL
        : rawAlgorithm;

    const normalizedAlgorithm = [
        ALGORITHM_BFS,
        ALGORITHM_PLATE_TRAVEL,
        ALGORITHM_FEWER_SWITCHES_FAST,
        ALGORITHM_WASD,
    ].includes(algorithm)
        ? algorithm
        : ALGORITHM_BFS;

    return {
        algorithm: normalizedAlgorithm,
        plateCount: config.plateCount,
        initialPositions: [...config.initialPositions],
        effectsRight: config.effectsRight.map((row) => [...row]),
        min: config.min,
        max: config.max,
        target: config.target,
    };
}

function findBfsSolutionOptimized(config) {
    const initialState = config.initialPositions;
    const startKey = stateKey(initialState);

    if (isGoal(initialState, config)) {
        return [];
    }

    const queue = [initialState];
    const cameFrom = new Map();
    const visited = new Set([startKey]);
    let cursor = 0;

    while (cursor < queue.length) {
        const current = queue[cursor++];
        const currentKey = stateKey(current);

        for (const move of enumerateMoves(config.plateCount)) {
            const nextState = applyMove(
                current,
                move.plateIndex,
                move.direction,
                config,
            );

            if (!nextState) {
                continue;
            }

            const nextKey = stateKey(nextState);

            if (visited.has(nextKey)) {
                continue;
            }

            visited.add(nextKey);
            cameFrom.set(nextKey, {
                parentKey: currentKey,
                plateIndex: move.plateIndex,
                direction: move.direction,
            });

            if (isGoal(nextState, config)) {
                const moveList = collectReverseMoves(nextKey, cameFrom, startKey);
                return buildStepsFromMoveList(initialState, moveList, config);
            }

            queue.push(nextState);
        }
    }

    return null;
}

function findFewerSwitchesFastSolution(config) {
    const initialState = config.initialPositions;
    const startKey = stateKey(initialState);

    if (isGoal(initialState, config)) {
        return [];
    }

    const queue = [initialState];
    const cameFrom = new Map();
    const visited = new Set([startKey]);
    let cursor = 0;

    while (cursor < queue.length) {
        const current = queue[cursor++];
        const currentKey = stateKey(current);

        for (let plateIndex = 0; plateIndex < config.plateCount; plateIndex++) {
            for (const direction of [+1, -1]) {
                let chainState = current;
                let chainParentKey = currentKey;

                while (true) {
                    const nextState = applyMove(chainState, plateIndex, direction, config);
                    if (!nextState) break;

                    const nextKey = stateKey(nextState);

                    if (visited.has(nextKey)) {
                        break;
                    }

                    visited.add(nextKey);
                    cameFrom.set(nextKey, {
                        parentKey: chainParentKey,
                        plateIndex,
                        direction
                    });

                    if (isGoal(nextState, config)) {
                        const moveList = collectReverseMoves(nextKey, cameFrom, startKey);
                        return buildStepsFromMoveList(initialState, moveList, config);
                    }

                    queue.push(nextState);

                    chainState = nextState;
                    chainParentKey = nextKey;
                }
            }
        }
    }

    return null;
}

function findWeightedSolution(config, createCost) {
    const initialState = config.initialPositions;
    const startKey = weightedStateKey(initialState, 0);
    const distances = new Map([[startKey, [0, 0, 0]]]);
    const cameFrom = new Map();
    const queue = new PriorityQueue(compareQueueItems);

    queue.push({
        state: initialState,
        cursorPlate: 0,
        cost: [0, 0, 0],
        order: 0,
    });

    let order = 1;

    while (queue.length > 0) {
        const current = queue.pop();
        const currentKey = weightedStateKey(current.state, current.cursorPlate);
        const bestCost = distances.get(currentKey);

        if (!bestCost || compareCost(current.cost, bestCost) !== 0) {
            continue;
        }

        if (isGoal(current.state, config)) {
            const moveList = collectReverseMoves(currentKey, cameFrom, startKey);
            return buildStepsFromMoveList(initialState, moveList, config);
        }

        for (const move of enumerateMoves(config.plateCount)) {
            const nextState = applyMove(
                current.state,
                move.plateIndex,
                move.direction,
                config,
            );

            if (!nextState) {
                continue;
            }

            const nextCost = addCost(
                current.cost,
                createCost(current.cursorPlate, move.plateIndex),
            );
            const nextKey = weightedStateKey(nextState, move.plateIndex);
            const oldCost = distances.get(nextKey);

            if (oldCost && compareCost(oldCost, nextCost) <= 0) {
                continue;
            }

            cameFrom.set(nextKey, {
                parentKey: currentKey,
                plateIndex: move.plateIndex,
                direction: move.direction,
            });

            distances.set(nextKey, nextCost);
            queue.push({
                state: nextState,
                cursorPlate: move.plateIndex,
                cost: nextCost,
                order: order++,
            });
        }
    }

    return null;
}

function createWasdCost(currentPlate, nextPlate) {
    const travel = Math.abs(nextPlate - currentPlate);

    return [travel + 1, 1, travel];
}

function createPlateTravelCost(currentPlate, nextPlate) {
    const travel = Math.abs(nextPlate - currentPlate);
    const isSwitch = currentPlate !== nextPlate ? 1 : 0;
    return [travel, 1, isSwitch];
}

function enumerateMoves(plateCount) {
    const moves = [];

    for (let plateIndex = 0; plateIndex < plateCount; plateIndex++) {
        moves.push({ plateIndex, direction: +1 });
        moves.push({ plateIndex, direction: -1 });
    }

    return moves;
}

function applyMove(state, plateIndex, direction, config) {
    const next = state.map((value, index) => {
        return value + config.effectsRight[plateIndex][index] * direction;
    });

    const legal = next.every((value) => value >= config.min && value <= config.max);

    return legal ? next : null;
}

function isGoal(state, config) {
    return state.every((value) => value === config.target);
}

function createStep(plateIndex, direction, before, after) {
    return {
        move: `${plateIndex + 1}${direction > 0 ? "R" : "L"}`,
        direction,
        plateIndex,
        before,
        after,
    };
}

function collectReverseMoves(goalKey, cameFrom, startKey) {
    const reverseMoves = [];
    let currentKey = goalKey;

    while (currentKey !== startKey) {
        const info = cameFrom.get(currentKey);
        if (!info) {
            break;
        }
        reverseMoves.push({
            plateIndex: info.plateIndex,
            direction: info.direction,
        });
        currentKey = info.parentKey;
    }

    reverseMoves.reverse();
    return reverseMoves;
}

function buildStepsFromMoveList(initialState, moveList, config) {
    let current = [...initialState];
    const steps = [];

    for (const m of moveList) {
        const before = [...current];
        const after = applyMove(current, m.plateIndex, m.direction, config);
        if (!after) {
            throw new Error("Illegal move during reconstruction");
        }
        steps.push(createStep(m.plateIndex, m.direction, before, after));
        current = after;
    }

    return steps;
}

function stateKey(state) {
    return state.join(",");
}

function weightedStateKey(state, cursorPlate) {
    return `${stateKey(state)}|${cursorPlate}`;
}

function addCost(left, right) {
    return [
        left[0] + right[0],
        left[1] + right[1],
        left[2] + right[2],
    ];
}

function compareCost(left, right) {
    for (let index = 0; index < left.length; index++) {
        if (left[index] !== right[index]) {
            return left[index] - right[index];
        }
    }

    return 0;
}

function compareQueueItems(left, right) {
    const costComparison = compareCost(left.cost, right.cost);

    if (costComparison !== 0) {
        return costComparison;
    }

    return left.order - right.order;
}

class PriorityQueue {
    constructor(compare) {
        this.items = [];
        this.compare = compare;
    }

    get length() {
        return this.items.length;
    }

    push(item) {
        this.items.push(item);
        this.bubbleUp(this.items.length - 1);
    }

    pop() {
        const first = this.items[0];
        const last = this.items.pop();

        if (this.items.length > 0) {
            this.items[0] = last;
            this.bubbleDown(0);
        }

        return first;
    }

    bubbleUp(index) {
        while (index > 0) {
            const parent = Math.floor((index - 1) / 2);

            if (this.compare(this.items[index], this.items[parent]) >= 0) {
                break;
            }

            this.swap(index, parent);
            index = parent;
        }
    }

    bubbleDown(index) {
        while (true) {
            const left = index * 2 + 1;
            const right = left + 1;
            let smallest = index;

            if (
                left < this.items.length &&
                this.compare(this.items[left], this.items[smallest]) < 0
            ) {
                smallest = left;
            }

            if (
                right < this.items.length &&
                this.compare(this.items[right], this.items[smallest]) < 0
            ) {
                smallest = right;
            }

            if (smallest === index) {
                break;
            }

            this.swap(index, smallest);
            index = smallest;
        }
    }

    swap(left, right) {
        const item = this.items[left];
        this.items[left] = this.items[right];
        this.items[right] = item;
    }
}
