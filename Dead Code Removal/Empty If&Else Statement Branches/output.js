function test_1() {
  if (yes4) {
    doSomething4;
  }
}

function test_2() {
  if (yes1) {
    doSomething1;

    if (yes2) {
      doSomething2;
    } else if (yes3) {
      doSomething3;

      if (yes4) {
        doSomething4;
      }
    }
  }
}

function test_3() {
  if (!no)
    if (yes1) {
      doSomething1;
      if (!no17)
        if (!no18) {
          if (yes2) {
            doSomething2;
          } else if (yes3) {
            doSomething3;

            if (yes4) {
              doSomething4;
            }
          } else if (!no20) {
            doSomethingIfNot20OrYes2OrYes3;
          }
        }
    }
}