import { prettyPrint } from './Utilities';
import { sizeMap } from './Maps';
import ParkingLot from './ParkingLot';

function App() {
  console.clear();
  // ----- SIMULATION -------------------

  // ----- CONFIGURE PARKING LOT -------
  // this will represent the parking slots and their sizes 
  const slots = [
    sizeMap.s, sizeMap.s, sizeMap.s, sizeMap.s, sizeMap.s, 
    sizeMap.m, sizeMap.m, sizeMap.m, sizeMap.m,
    sizeMap.l, sizeMap.l, sizeMap.l,
  ];

  // this will be the initial number of entrance/exit count
  const entranceExitCount = 3;

  // this will represent the distance from slot to entrance/exit 
  const slotDistanceToEntranceExitMap = [
    [1, 3, 4], [2, 5, 1], [5, 3, 4], [6, 5, 3], [7, 5, 3],
    [1, 3, 4], [2, 4, 5], [5, 3, 4], [6, 5, 3], 
    [1, 3, 4], [2, 4, 5], [3, 5, 6], 
  ];

  // ----- CREATE PARKING LOT INSTANCE -------
  const parkingLot = ParkingLot({
    entranceExitCount,
    slots,
    slotDistanceToEntranceExitMap
  });

  // get the entrance and exit ids
  const entranceExitIds = parkingLot.entranceExitIds;

  // ----- 1. SIMULATE TRUCK PARKING (large sized vehicle) ENTERED IN ENTRANCE ID 0 ------
  const truckParking1 = {
    plateNumber: '4',
    vehicleSize: sizeMap.l,
    entranceId: entranceExitIds[0]
  }

  prettyPrint('1. SIMULATE CAR (medium sized vehicle) PARKING ==>', truckParking1);

  const { id: truckParking1SlotId, size: truckParking1Size } = parkingLot.findSlot({ vehicleSize: truckParking1.vehicleSize, entranceExitId: truckParking1.entranceId });

  prettyPrint('1. AVAILABLE NEAREST PARKING SLOT ==>', { truckParking1SlotId, truckParking1Size });

  // park truck1
  const truckParking1Index = parkingLot.park({
    plateNumber: truckParking1.plateNumber,
    slotId: truckParking1SlotId,
    entranceDate: new Date(2022, 6, 6, 13, 0) // July 06, 2022 1:00 PM
  });

  prettyPrint('1. TRANSACTION ID ==>', truckParking1Index);
  prettyPrint('PARKING TRANSACTIONS ==>', parkingLot.transactions);

  // unpark truck1
  const truckParking1ParkFee = parkingLot.unpark({
    transactionIndex: truckParking1Index,
    exitDate: new Date(2022, 6, 8, 14, 0) // July 06, 2022 4:29 PM
  });

  prettyPrint('1. PARKING FEE ==>', truckParking1ParkFee);
  prettyPrint('PARKING TRANSACTIONS ==>', parkingLot.transactions);

  // for testing purposes - display values
  const displayValue = parkingLot.slotsAvailable.map(( isAvailable, index ) => ({
    id: index,
    size: slots[index],
    isAvailable,
    distanceToEntrancesAndExits: slotDistanceToEntranceExitMap[index]
  }))

  return (
    <div><pre>{JSON.stringify(displayValue, null, 2)}</pre></div>
  )
}

export default App
