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
{
    this.showing_bottom_sheet && (
          <BottomSheet
            default_snap={70}
            snaps={[0, 25, 75, 90]}
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
    )
}
```