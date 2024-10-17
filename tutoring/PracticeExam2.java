import java.util.Scanner;

class PracticeExam2{
    public static void main(String[] args){
        ////// Question 6
        
        Scanner kb = new Scanner(System.in);

        // "create an array named arr1 that can hold 3 integers"
        int[] arr1 = new int[3];

        System.out.println("Please enter 3 integers:");
        for(int i = 0; i < arr1.length; i++){
            arr1[i] = kb.nextInt();
        }

        printArray(arr1);

        int biggest = largest(arr1);
        System.out.println("Biggest: " + biggest);

        int numSevens = count(arr1,7);
        System.out.println("Number of sevens: " + numSevens);

        int[] arr2 = clone(arr1);
        printArray(arr2);
    }

    ////// Question 2
    static void printArray(int[] arr){
        for(int i = 0; i < arr.length; i++){
            System.out.print(arr[i]+" ");
        }
        System.out.println();
    }

    ////// Question 3
    static int largest(int[] arr){
        if(arr.length > 0){ // <-- check if the array has some elements in it
            int largest = arr[0];

            for(int i = 1; i < arr.length; i++){
                if(arr[i] > largest){
                    largest = arr[i];
                }
            }

            return largest;
        }
        else{
            return 0; // <-- the array is empty so return 0
        }
    }

    ////// Question 4
    // counts how many times k is in arr
    static int count(int[] arr, int k){
        int cnt = 0;
        
        for(int i = 0; i < arr.length; i++){
            if(arr[i] == k){
                cnt++;
            }
        }
        
        return cnt;
    }

    ////// Question 5
    static int[] clone(int[] arr){
        int[] newArr = new int[arr.length]; // <-- create a new array with the same length as arr

        for(int i = 0; i < arr.length; i++){
            newArr[i] = arr[i]; // <-- copy each element from arr into newArr
        }

        return newArr;
    }
}