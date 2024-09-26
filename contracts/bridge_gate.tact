import "@stdlib/ownable";
import "./messages";

message TransferEvent {
    msgSender: Address;
    tokenSender: Address;
    jettonAmount: Int as coins;
    forward_payload: Slice as remaining;
}

contract BridgeGate with Ownable {
    owner: Address;

    init(owner: Address) {
        self.owner = owner;
    }

    receive("Init") {
        emit("Hello".asComment());
    }

    receive(msg: TokenNotification){
        let ctx: Context = context();

        emit(TransferEvent{msgSender:ctx.sender, tokenSender:msg.from, jettonAmount:msg.amount, forward_payload: msg.forward_payload}.toCell())
    }
}
