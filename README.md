# Nullstack Bottomsheet

### Installation

```bash
yarn add nullstack-bottomsheet
```

or

```bash
npm install nullstack-bottomsheet
```

### Usage

To use `nullstack-bottomsheet` you should import it, then wrap the sheet content with it.

### Example

```tsx
<div>
  {this.showing_bottom_sheet && (
    <BottomSheet
      default_snap={75}
      snaps={[0, 25, 75, 90]}
      snapping_time={100}
      close_on_snap_to_zero
      onclose={() => (this.showing_bottom_sheet = false)}
      onsnap={(snap) => console.log(`snapping to ${snap}% of screen height`)} // <-- fired when releasing the finger from screen and snaps to one of the snaps positions configured on the `snaps` property
    >
      <div style="padding: 32px; color: black">
        <h1>Hello you</h1>
        <h2>All good?</h2>
        <h3 style="margin-top:300px">All good?</h3>
      </div>
    </BottomSheet>
  )}
</div>
```
