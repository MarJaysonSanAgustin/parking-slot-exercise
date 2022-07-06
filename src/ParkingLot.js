import { pricingMatrixMap, sizeMap } from './Maps';
import { getHourDifference } from './Utilities';

const ParkingLot = ({ entranceExitCount, slots, slotDistanceToEntranceExitMap }) => {
  // validate inputs 
  // check for valid input for entrance or exit count
  if (typeof entranceExitCount !== 'number' && entranceExitCount < 3) {
    console.error('invalid entrance/exit count!');
    return;
  }

  // check for valid slots input
  if (!slots && slots?.length && slots.length < 1 ) {
    console.error('invalid slots');
    return;
  }
  
  // check for valid slotDistanceToEntranceExitMap input
  if (!slotDistanceToEntranceExitMap && slotDistanceToEntranceExitMap?.length && slotDistanceToEntranceExitMap.length < 1 ) {
    console.error('invalid slot distance to entrance/exit map');
    return;
  }

  // check if slot and slotDistanceToEntranceExitMap ratio matches
  if (slots.length !== slotDistanceToEntranceExitMap.length) {
    console.error('invalid slot to slot distance to entrance/exit ratio');
    return;
  }

  // container for transactions
  const transactions = [];

  // by default all slots are available on parking lots creation/initialization
  const slotsAvailable = slots.map(() => true);

  // generate entrance/exit ids
  const entranceExitIds = Array(entranceExitCount).fill(0).map((_, index) => index);

  const findSlot = ({ vehicleSize, entranceExitId }) => {
    // validate allowed vehicle size
    if (!Object.values(sizeMap).includes(vehicleSize)) {
      console.error('invalid vehicle size. do not worry, we will accomodate smaller/larger vehicles in the future!');
      return;
    }

    // validate allowed entrance ids
    if (!entranceExitIds.includes(entranceExitId)) {
      console.error('invalid entrance/exit id');
      return;
    }

    // find the nearest slot to the entrance using entranceExitId provided
    const nearestAvailableSlot = Object.values(slotDistanceToEntranceExitMap)
      // get slot availability and size from entered slot value since they shared a positional value
      .map((distance, index) => ({
        id: index,
        size: slots[index],
        isAvailable: slotsAvailable[index],
        value: distance[entranceExitId]
      }))
      // filter slot by size and availability
      .filter((slot) => slot.size >= vehicleSize && slot.isAvailable)
      // sort by the nearest value
      .sort((a, b) => a.value - b.value)
      // get the first value
      [0];

    if (!nearestAvailableSlot) {
      console.warn('Sorry. No available spot for you vehicle')
      return;
    }
    
    return nearestAvailableSlot;
  }

  const park = ({ plateNumber, slotId, entranceDate }) => {
    const isParked = transactions.find(transaction => transaction.plateNumber === plateNumber && !transaction.isComplete)
    if (isParked) {
      console.warn('Car is already parked!')
      return;
    }

    if (!slotsAvailable[slotId]) {
      console.warn('Sorry. The spot is no longer available')
      return;
    }

    // mark slot as unavailable
    slotsAvailable[slotId] = false;

    // create a transaction
    const transaction = {
      plateNumber,
      slotId,
      entranceDate,
      isComplete: false
    };
    transactions.push(transaction);

    return transactions.indexOf(transaction);
  };

  const unpark = ({ transactionIndex, exitDate }) => {
    const transaction = transactions[transactionIndex];

    if (transaction.isComplete) {
      console.warn('Duplicate unpark operation')
      return;
    }

    // mark slot as available
    slotsAvailable[transaction.slotId] = true;
    
    // mark transaction as complete
    transaction.isComplete = true;
    transaction.exitDate = exitDate;

    const { difference, fee } = calculateFee(transaction);
    return { timeConsumed: difference, fee };
  };

  const calculateFee = (transaction) => {
    const { entranceDate, exitDate, slotId } = transaction;
    let fee = pricingMatrixMap.base;
    const slotSize = slots[slotId];

    const difference = getHourDifference(entranceDate, exitDate);
    const pricePerSize = pricingMatrixMap[`size-${slotSize}`];
    
    if (difference > 3 && difference < 24) {
      fee += (difference - 3) * pricePerSize
    } else if (difference === 24) {
      fee = pricingMatrixMap.wholeDay
    } else if (difference > 24) {
      fee = (Math.floor(difference / 24)) * pricingMatrixMap.wholeDay;
      fee += (difference % 24) * pricePerSize
    }
    return { difference, fee };
  };


  return { park, unpark, slotsAvailable, entranceExitIds, findSlot, transactions };
};

export default ParkingLot;
