#include <fcntl.h>      /* open */ 
#include <unistd.h>     /* exit */
#include <linux/ioctl.h>
#include <stdio.h>

struct myTestStruct {
  int testsize;
  char* testbuff;
};

#define MAJOR_NUM  100
#define REQUEST _IOR(MAJOR_NUM, 0, struct myTestStruct)

int main()
{
  for(;;) {
    int file_desc;

    file_desc = open("/dev/char", 0);
    if (file_desc < 0) {
      printf ("Can't open device file: %s\n", "/dev/char");
      return -1;
    }
    printf("Sending IOCTL: %d, %d\n", REQUEST, sizeof(struct myTestStruct));


    char* teststr = "123\n";
    struct myTestStruct s = {testsize: 2, testbuff: teststr};
    for (int i=0; i < 16; i++) {
      printf("%02x ",(unsigned int) ((char*)&s)[i]);
      //printf("%02X ",p[i]);
    }

    int resp = ioctl(file_desc, REQUEST, &s);
    printf("Got this resp %d\n", resp);

    close(file_desc); 
    sleep(1);
  }
}
