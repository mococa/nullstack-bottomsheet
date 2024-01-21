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
  {
    <BottomSheet
      default_snap={75}
      snaps={[0, 25, 75, 90]}
      showing={this.showing_bottom_sheet}
      onclose={() => (this.showing_bottom_sheet = false)}
      snapping_time={100}
      close_on_snap_to_zero
    >
      <div style="padding: 32px; color: black">
        <h1>Hello you</h1>
        <h2>All good?</h2>
        <h3 style="margin-top:300px">All good?</h3>
      </div>
    </BottomSheet>
  }
</div>
```
