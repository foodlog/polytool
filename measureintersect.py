# importing modules
import math

polygonA = [1, 1, 1, 2, 2, 3, 4, 2, 4, 1]
polygonB = [2, 2, 4, 3, 6, 2]

# Calculating Max & Min of the arrays
AmaxX = max(polygonA[::2])
AmaxY = max(polygonA[1::2])
AminX = min(polygonA[::2])
AminY = min(polygonA[1::2])

# print("Largest X co-ordonate = " + str(AmaxX))
# print("Largest Y co-ordonate = " + str(AmaxY))
#
# print("Smallest X co-ordonate = " + str(AminX))
# print("Smallest Y co-ordonate = " + str(AminY))

# Bbox Corner dimensions (Clockwise order)
A_topleft = (AminX, AmaxY)
A_topright = (AmaxX, AmaxY)
A_bottomright = (AmaxX, AminY)
A_bottomleft = (AminX, AminY)

print("Bbox A : " + str(A_topleft) + ", " + str(A_topright) + ", " + str(A_bottomright) + ", " + str(A_bottomleft))
print("Bbox B : ")

A_length = len(polygonA)
B_length = len(polygonB)


def equalize_dimensions(polygonA, polygonB, A_length, B_length):
    global M
    global difference

    difference = (A_length - B_length)
    # while(A_length != B_length):

    while(difference != 0):
        M = ((polygonA[0] + polygonA[-2])/difference, (polygonA[1] + polygonA[-1])/difference)
        difference -= 1
        polygonB.extend(M)
        return M, polygonA

equalize_dimensions(polygonA, polygonB, A_length, B_length)

print("polygonA : " + str(polygonA))
print("polygonB : " + str(polygonB))

print("Midpoint : " + str(M))
print("Difference : " + str(abs(difference)))
