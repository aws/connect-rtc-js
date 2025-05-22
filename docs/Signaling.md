# Signaling State Diagram

```mermaid
stateDiagram-v2
    [*] --> PendingConnection
    PendingConnection --> PendingInvite
    PendingConnection --> PendingConnection : RETRY
    PendingConnection --> Failed
    PendingInvite --> PendingAnswer
    PendingInvite --> Failed
    PendingAnswer --> PendingAccept
    PendingAnswer --> Failed
    PendingAccept --> PendingAcceptAck
    PendingAccept --> Failed
    PendingAcceptAck --> Talking
    PendingAcceptAck --> Failed
    Talking --> PendingRemoteHangup
    Talking --> PendingLocalHangup
    Talking --> PendingReconnect
    PendingReconnect --> Talking
    PendingReconnect --> Failed
    PendingRemoteHangup --> Disconnected
    PendingLocalHangup --> Disconnected
```